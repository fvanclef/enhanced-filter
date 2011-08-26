(function($) {

    var uid = 0;

    $.getUID = function() {

        uid++;

        return 'jQ-uid-'+uid;

    };

    $.fn.getUID = function() {

        if(!this.length) {

            return 0;

        }

        var fst = this.first(), id = fst.attr('id');

        if(!id) {

            id = $.getUID();

            fst.attr('id', id);

        }

        return fst;

    }

})(jQuery);


(function($) { 

  $.widget("ui.enhanced_filter", { 
  
    options: {
      separator: '>>',
      initial_text: 'Set Filter'  
    },
    _create: function() {

      var self = this, o = self.options, el = self.element;

      var enhanced_filter_menu = self._get_enhanced_filter_menu();

      if (enhanced_filter_menu == undefined || enhanced_filter_menu == null || enhanced_filter_menu.length == 0) {

        enhanced_filter_menu = $('<div/>').attr('id',this._get_enhanced_filter_menu_id()).addClass('filter_context_menu ui-widget-content ui-corner-all').hide().appendTo($('body'));

        $('<div/>').addClass('filter_context_menu_content').appendTo(enhanced_filter_menu).html($(o.menu).html());
        $('<div/>').appendTo(enhanced_filter_menu).append($('<button/>').addClass('done_menu_button menu_button').text('Done')).append($('<button/>').addClass('cancel_menu_button menu_button').text('Cancel'));

        $('.menu_button').button();

        enhanced_filter_menu.find('.done_menu_button').bind('click',function(event){
          
          var hash = self._get_data_from_form();
          self._populate_filter(hash);
          self.hide_menu(enhanced_filter_menu.data('filter_element').attr('id'));
        });

        enhanced_filter_menu.find('.cancel_menu_button').bind('click',function(){
          self.hide_menu(enhanced_filter_menu.data('filter_element').attr('id'));
        });


      }

      el.addClass('ui-widget ui-widget-content ui-corner-all enhanced_filter');
      if (o.title) {
         $('<div/>').appendTo(el).addClass('filter_header ui-widget-header ui-corner-all').text(o.title);
      }
      var content = $('<div/>').appendTo(el).addClass('filter_content');

      this.add_filter();

    },
    _populate_filter : function(hash) {

      var self = this;

      this.element.find('.filter_element:not(:last-child)').each(function(index,filter_element) {      
        var name = $(this).data('property');
        if (hash[name]) {
          self.set_filter_values($(this).attr('id'),hash[name].label,name,hash[name].values);            
        }
        else {
          $(this).find('.filter_remove_element').trigger('click');
        }
        delete hash[name];

      });

      $.each(hash,function(key,data){
        filter_element = self.element.find('.filter_element:last-child')
        self.set_filter_values(filter_element.attr('id'),data.label,key,data.values);                 
      });

    },
    _get_filter_element :function(key) {  
       
        var filter_el = null; 
        this.element.find('.filter_element:not(:last-child)').each(function(index,filter_element) {
          if ($(filter_element).data('property') == key ) {
            filter_el = $(filter_element);
            return false;
          } 
        });
        return filter_el;

    },
    _get_enhanced_filter_menu_id : function() {
        
      return 'enhanced_filter_menu_' + this.element.attr('id');       

    },
    _get_enhanced_filter_menu : function() {
        
      return $('#' + this._get_enhanced_filter_menu_id() );

    },
    _get_data_from_form : function() {

          var hash = {}; 

          this._get_enhanced_filter_menu().find('.filter_context_menu_content input:checkbox:checked:enabled').each(function(index,checkbox){
            var name = $(checkbox).attr('name');
            var value = $(checkbox).attr('value');
            var label = $(checkbox).attr('label');
            if (hash[name] == undefined ) {
               hash[name] = {label:label, values:[value]};   
            }
            else {
               hash[name].values.push(value);
            }
          });
          return hash;

    },
    _add_filter_element: function(el) {

      var last_filter = el.children(':last-child');

      last_filter.append(this._add_remove_element());

      filter_element = $('<span/>').addClass('filter_element').append($('<span>').addClass('filter_element_label ui-state-default ui-state-active').text(this.options.initial_text)).getUID();
      if (el.children().length > 0 ) {
        filter_element.prepend(this._add_separator_element());
      }
      el.append(filter_element);
      return filter_element;

    },
    _add_remove_element: function() {

      var self = this;
      var remove_element = $('<span/>').addClass('ui-icon ui-icon-close filter_remove_element');
      remove_element.bind('click',function(){
        var filter_element = $($(this).parent());
        self._clean_menu_form(filter_element);
        filter_element.remove();        
        self._clean_separator();
        self._trigger('change',null,self);
       }); 
       return remove_element;     
    },
    _clean_menu_form: function(filter_element) {

      var self = this;
      var name = filter_element.data('property');
      var values = filter_element.data('values');
      $.each(values,function(key,value) { 
        self._get_enhanced_filter_menu().find('input:checkbox[name="' + name + '"][value="' + value + '"]').first().attr('checked',false);
      }) 

    },
    _add_separator_element: function(){

      return $('<span/>').addClass('filter_separator_element').html(this.options.separator);

    },
    add_filter: function() {
      var filter_element = this._add_filter_element(this.element.children('.filter_content'));
      var self = this;

      filter_element.bind('click', function(event) {
        self._trigger('click',event,{filter: self,filter_element: $(this)});  
      })
      return filter_element;

    },
    get_query_string: function() {

       var txt = '';
       this.element.find('.filter_element:not(:last-child)').each(function(index,filter){
         txt = txt + $(filter).data('property') + '=' + $(filter).data('values').join(',') + '&';   
       }); 
       return txt;

    },

    set_filter_values: function(id,label,property,values) {
       var el = $('#' + id); 
       var el_label = el.find('.filter_element_label'); 
       el_label.removeClass('ui-state-active');
       el.data('property',property);
       el.data('values',values);
       el.data('label',label);
       var txt= label + ': ';
       $.each(values,function(index,value) {
         if (index > 0) {
           txt = txt + ' or ';
         }  
         txt = txt + value;
       });
       el_label.text(txt);
       if (this.element.find('.filter_element:last-child').attr('id') == id ) {
         this.add_filter();
       }
       this._trigger('change',null,this);
       
    },
    destroy: function() {   

      $.Widget.prototype.destroy.apply(this, arguments); 
      this.element.find('.filter_element').each(function(filter_element) {
      
        filter_element.unbind();

      });
    },
    _setOption: function(option, value) {
      $.Widget.prototype._setOption.apply( this, arguments );
    },
    _clean_separator: function() {
      this.element.find('.filter_element:first-child').find('.filter_separator_element').remove();

    },
    show_menu: function(id){

       var el = $('#' + id); 
       var offset =  el.offset(); 
       el.addClass('ui-state-active filter_element_label');
       var enhanced_filter = this._get_enhanced_filter_menu();
       enhanced_filter.data('filter_element',el);
       enhanced_filter.css('left',(offset.left + ($(el).width()/2))).css('top',(offset.top + $(el).height())).css('position','absolute').css('z-index','100002').show();
    },
    hide_menu: function(id){

       var el = $('#' + id); 
       el.removeClass('ui-state-active');
       this._get_enhanced_filter_menu().hide();
    },
    _reset : function(){

   }

  
  });  


})(jQuery); 
