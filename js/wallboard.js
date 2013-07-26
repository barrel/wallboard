/*
wallboard - v - 2013-07-26
An app to make a dashboard for the wallboard.
Lovingly coded by Jess Frazelle - BarrelNY  - http://barrelny.com 
*/
(function() {
  var SelectParser;

  SelectParser = (function() {

    function SelectParser() {
      this.options_index = 0;
      this.parsed = [];
    }

    SelectParser.prototype.add_node = function(child) {
      if (child.nodeName.toUpperCase() === "OPTGROUP") {
        return this.add_group(child);
      } else {
        return this.add_option(child);
      }
    };

    SelectParser.prototype.add_group = function(group) {
      var group_position, option, _i, _len, _ref, _results;
      group_position = this.parsed.length;
      this.parsed.push({
        array_index: group_position,
        group: true,
        label: group.label,
        children: 0,
        disabled: group.disabled
      });
      _ref = group.childNodes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        option = _ref[_i];
        _results.push(this.add_option(option, group_position, group.disabled));
      }
      return _results;
    };

    SelectParser.prototype.add_option = function(option, group_position, group_disabled) {
      if (option.nodeName.toUpperCase() === "OPTION") {
        if (option.text !== "") {
          if (group_position != null) {
            this.parsed[group_position].children += 1;
          }
          this.parsed.push({
            array_index: this.parsed.length,
            options_index: this.options_index,
            value: option.value,
            text: option.text,
            html: option.innerHTML,
            selected: option.selected,
            disabled: group_disabled === true ? group_disabled : option.disabled,
            group_array_index: group_position,
            classes: option.className,
            style: option.style.cssText
          });
        } else {
          this.parsed.push({
            array_index: this.parsed.length,
            options_index: this.options_index,
            empty: true
          });
        }
        return this.options_index += 1;
      }
    };

    return SelectParser;

  })();

  SelectParser.select_to_array = function(select) {
    var child, parser, _i, _len, _ref;
    parser = new SelectParser();
    _ref = select.childNodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      child = _ref[_i];
      parser.add_node(child);
    }
    return parser.parsed;
  };

  this.SelectParser = SelectParser;

}).call(this);

/*
Chosen source: generate output using 'cake build'
Copyright (c) 2011 by Harvest
*/


(function() {
  var AbstractChosen, root;

  root = this;

  AbstractChosen = (function() {

    function AbstractChosen(form_field, options) {
      this.form_field = form_field;
      this.options = options != null ? options : {};
      if (!AbstractChosen.browser_is_supported()) {
        return;
      }
      this.is_multiple = this.form_field.multiple;
      this.set_default_text();
      this.set_default_values();
      this.setup();
      this.set_up_html();
      this.register_observers();
      this.finish_setup();
    }

    AbstractChosen.prototype.set_default_values = function() {
      var _this = this;
      this.click_test_action = function(evt) {
        return _this.test_active_click(evt);
      };
      this.activate_action = function(evt) {
        return _this.activate_field(evt);
      };
      this.active_field = false;
      this.mouse_on_container = false;
      this.results_showing = false;
      this.result_highlighted = null;
      this.result_single_selected = null;
      this.allow_single_deselect = (this.options.allow_single_deselect != null) && (this.form_field.options[0] != null) && this.form_field.options[0].text === "" ? this.options.allow_single_deselect : false;
      this.disable_search_threshold = this.options.disable_search_threshold || 0;
      this.disable_search = this.options.disable_search || false;
      this.enable_split_word_search = this.options.enable_split_word_search != null ? this.options.enable_split_word_search : true;
      this.search_contains = this.options.search_contains || false;
      this.choices = 0;
      this.single_backstroke_delete = this.options.single_backstroke_delete || false;
      this.max_selected_options = this.options.max_selected_options || Infinity;
      return this.inherit_select_classes = this.options.inherit_select_classes || false;
    };

    AbstractChosen.prototype.set_default_text = function() {
      if (this.form_field.getAttribute("data-placeholder")) {
        this.default_text = this.form_field.getAttribute("data-placeholder");
      } else if (this.is_multiple) {
        this.default_text = this.options.placeholder_text_multiple || this.options.placeholder_text || AbstractChosen.default_multiple_text;
      } else {
        this.default_text = this.options.placeholder_text_single || this.options.placeholder_text || AbstractChosen.default_single_text;
      }
      return this.results_none_found = this.form_field.getAttribute("data-no_results_text") || this.options.no_results_text || AbstractChosen.default_no_result_text;
    };

    AbstractChosen.prototype.mouse_enter = function() {
      return this.mouse_on_container = true;
    };

    AbstractChosen.prototype.mouse_leave = function() {
      return this.mouse_on_container = false;
    };

    AbstractChosen.prototype.input_focus = function(evt) {
      var _this = this;
      if (this.is_multiple) {
        if (!this.active_field) {
          return setTimeout((function() {
            return _this.container_mousedown();
          }), 50);
        }
      } else {
        if (!this.active_field) {
          return this.activate_field();
        }
      }
    };

    AbstractChosen.prototype.input_blur = function(evt) {
      var _this = this;
      if (!this.mouse_on_container) {
        this.active_field = false;
        return setTimeout((function() {
          return _this.blur_test();
        }), 100);
      }
    };

    AbstractChosen.prototype.result_add_option = function(option) {
      var classes, style;
      if (!option.disabled) {
        option.dom_id = this.container_id + "_o_" + option.array_index;
        classes = option.selected && this.is_multiple ? [] : ["active-result"];
        if (option.selected) {
          classes.push("result-selected");
        }
        if (option.group_array_index != null) {
          classes.push("group-option");
        }
        if (option.classes !== "") {
          classes.push(option.classes);
        }
        style = option.style.cssText !== "" ? " style=\"" + option.style + "\"" : "";
        return '<li id="' + option.dom_id + '" class="' + classes.join(' ') + '"' + style + '>' + option.html + '</li>';
      } else {
        return "";
      }
    };

    AbstractChosen.prototype.results_update_field = function() {
      this.set_default_text();
      if (!this.is_multiple) {
        this.results_reset_cleanup();
      }
      this.result_clear_highlight();
      this.result_single_selected = null;
      return this.results_build();
    };

    AbstractChosen.prototype.results_toggle = function() {
      if (this.results_showing) {
        return this.results_hide();
      } else {
        return this.results_show();
      }
    };

    AbstractChosen.prototype.results_search = function(evt) {
      if (this.results_showing) {
        return this.winnow_results();
      } else {
        return this.results_show();
      }
    };

    AbstractChosen.prototype.choices_click = function(evt) {
      evt.preventDefault();
      if (!this.results_showing) {
        return this.results_show();
      }
    };

    AbstractChosen.prototype.keyup_checker = function(evt) {
      var stroke, _ref;
      stroke = (_ref = evt.which) != null ? _ref : evt.keyCode;
      this.search_field_scale();
      switch (stroke) {
        case 8:
          if (this.is_multiple && this.backstroke_length < 1 && this.choices > 0) {
            return this.keydown_backstroke();
          } else if (!this.pending_backstroke) {
            this.result_clear_highlight();
            return this.results_search();
          }
          break;
        case 13:
          evt.preventDefault();
          if (this.results_showing) {
			if (this.search_results.find('.no-results').length>0){
				this.search_results.find('.no-results').trigger('click');
			} else {
	            return this.result_select(evt);
			}
          }
          break;
        case 27:
          if (this.results_showing) {
            this.results_hide();
          }
          return true;
        case 9:
        case 38:
        case 40:
        case 16:
        case 91:
        case 17:
          break;
        default:
          return this.results_search();
      }
    };

    AbstractChosen.prototype.generate_field_id = function() {
      var new_id;
      new_id = this.generate_random_id();
      this.form_field.id = new_id;
      return new_id;
    };

    AbstractChosen.prototype.generate_random_char = function() {
      var chars, newchar, rand;
      chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      rand = Math.floor(Math.random() * chars.length);
      return newchar = chars.substring(rand, rand + 1);
    };

    AbstractChosen.prototype.container_width = function() {
      if (this.options.width != null) {
        return this.options.width;
      } else {
        return "" + this.form_field.offsetWidth + "px";
      }
    };

    AbstractChosen.browser_is_supported = function() {
      var _ref;
      if (window.navigator.appName === "Microsoft Internet Explorer") {
        return (null !== (_ref = document.documentMode) && _ref >= 8);
      }
      return true;
    };

    AbstractChosen.default_multiple_text = "Select Some Options";

    AbstractChosen.default_single_text = "Select an Option";

    AbstractChosen.default_no_result_text = "No results match";

    return AbstractChosen;

  })();

  root.AbstractChosen = AbstractChosen;

}).call(this);

/*
Chosen source: generate output using 'cake build'
Copyright (c) 2011 by Harvest
*/


(function() {
  var $, Chosen, root,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  root = this;

  $ = jQuery;

  $.fn.extend({
    chosen: function(options) {
      if (!AbstractChosen.browser_is_supported()) {
        return this;
      }
      return this.each(function(input_field) {
        var $this;
        $this = $(this);
        if (!$this.hasClass("chzn-done")) {
          return $this.data('chosen', new Chosen(this, options));
        }
      });
    }
  });

  Chosen = (function(_super) {

    __extends(Chosen, _super);

    function Chosen() {
      return Chosen.__super__.constructor.apply(this, arguments);
    }

    Chosen.prototype.setup = function() {
      this.form_field_jq = $(this.form_field);
      this.current_selectedIndex = this.form_field.selectedIndex;
      return this.is_rtl = this.form_field_jq.hasClass("chzn-rtl");
    };

    Chosen.prototype.finish_setup = function() {
      return this.form_field_jq.addClass("chzn-done");
    };

    Chosen.prototype.set_up_html = function() {
      var container_classes, container_props;
      this.container_id = this.form_field.id.length ? this.form_field.id.replace(/[^\w]/g, '_') : this.generate_field_id();
      this.container_id += "_chzn";
      container_classes = ["chzn-container"];
      container_classes.push("chzn-container-" + (this.is_multiple ? "multi" : "single"));
      if (this.inherit_select_classes && this.form_field.className) {
        container_classes.push(this.form_field.className);
      }
      if (this.is_rtl) {
        container_classes.push("chzn-rtl");
      }
      container_props = {
        'id': this.container_id,
        'class': container_classes.join(' '),
        'style': "width: " + (this.container_width()) + ";",
        'title': this.form_field.title
      };
      this.container = $("<div />", container_props);
      if (this.is_multiple) {
        this.container.html('<ul class="chzn-choices"><li class="search-field"><input type="text" value="' + this.default_text + '" class="default" autocomplete="off" style="width:25px;" /></li></ul><div class="chzn-drop"><ul class="chzn-results"></ul></div>');
      } else {
        this.container.html('<a href="javascript:void(0)" class="chzn-single chzn-default" tabindex="-1"><span>' + this.default_text + '</span><div><b></b></div></a><div class="chzn-drop"><div class="chzn-search"><input type="text" autocomplete="off" /></div><ul class="chzn-results"></ul></div>');
      }
      this.form_field_jq.hide().after(this.container);
      this.dropdown = this.container.find('div.chzn-drop').first();
      this.search_field = this.container.find('input').first();
      this.search_results = this.container.find('ul.chzn-results').first();
      this.search_field_scale();
      this.search_no_results = this.container.find('li.no-results').first();
      if (this.is_multiple) {
        this.search_choices = this.container.find('ul.chzn-choices').first();
        this.search_container = this.container.find('li.search-field').first();
      } else {
        this.search_container = this.container.find('div.chzn-search').first();
        this.selected_item = this.container.find('.chzn-single').first();
      }
      this.results_build();
      this.set_tab_index();
      this.set_label_behavior();
      return this.form_field_jq.trigger("liszt:ready", {
        chosen: this
      });
    };

    Chosen.prototype.register_observers = function() {
      var _this = this;
      this.container.mousedown(function(evt) {
        _this.container_mousedown(evt);
      });
      this.container.mouseup(function(evt) {
        _this.container_mouseup(evt);
      });
      this.container.mouseenter(function(evt) {
        _this.mouse_enter(evt);
      });
      this.container.mouseleave(function(evt) {
        _this.mouse_leave(evt);
      });
      this.search_results.mouseup(function(evt) {
        _this.search_results_mouseup(evt);
      });
      this.search_results.mouseover(function(evt) {
        _this.search_results_mouseover(evt);
      });
      this.search_results.mouseout(function(evt) {
        _this.search_results_mouseout(evt);
      });
      this.search_results.bind('mousewheel DOMMouseScroll', function(evt) {
        _this.search_results_mousewheel(evt);
      });
      this.form_field_jq.bind("liszt:updated", function(evt) {
        _this.results_update_field(evt);
      });
      this.form_field_jq.bind("liszt:activate", function(evt) {
        _this.activate_field(evt);
      });
      this.form_field_jq.bind("liszt:open", function(evt) {
        _this.container_mousedown(evt);
      });
      this.search_field.blur(function(evt) {
        _this.input_blur(evt);
      });
      this.search_field.keyup(function(evt) {
        _this.keyup_checker(evt);
      });
      this.search_field.keydown(function(evt) {
        _this.keydown_checker(evt);
      });
      this.search_field.focus(function(evt) {
        _this.input_focus(evt);
      });
      if (this.is_multiple) {
        return this.search_choices.click(function(evt) {
          _this.choices_click(evt);
        });
      } else {
        return this.container.click(function(evt) {
          evt.preventDefault();
        });
      }
    };

    Chosen.prototype.search_field_disabled = function() {
      this.is_disabled = this.form_field_jq[0].disabled;
      if (this.is_disabled) {
        this.container.addClass('chzn-disabled');
        this.search_field[0].disabled = true;
        if (!this.is_multiple) {
          this.selected_item.unbind("focus", this.activate_action);
        }
        return this.close_field();
      } else {
        this.container.removeClass('chzn-disabled');
        this.search_field[0].disabled = false;
        if (!this.is_multiple) {
          return this.selected_item.bind("focus", this.activate_action);
        }
      }
    };

    Chosen.prototype.container_mousedown = function(evt) {
      if (!this.is_disabled) {
        if (evt && evt.type === "mousedown" && !this.results_showing) {
          evt.preventDefault();
        }
        if (!((evt != null) && ($(evt.target)).hasClass("search-choice-close"))) {
          if (!this.active_field) {
            if (this.is_multiple) {
              this.search_field.val("");
            }
            $(document).click(this.click_test_action);
            this.results_show();
          } else if (!this.is_multiple && evt && (($(evt.target)[0] === this.selected_item[0]) || $(evt.target).parents("a.chzn-single").length)) {
            evt.preventDefault();
            this.results_toggle();
          }
          return this.activate_field();
        }
      }
    };

    Chosen.prototype.container_mouseup = function(evt) {
      if (evt.target.nodeName === "ABBR" && !this.is_disabled) {
        return this.results_reset(evt);
      }
    };

    Chosen.prototype.search_results_mousewheel = function(evt) {
      var delta, _ref, _ref1;
      delta = -((_ref = evt.originalEvent) != null ? _ref.wheelDelta : void 0) || ((_ref1 = evt.originialEvent) != null ? _ref1.detail : void 0);
      if (delta != null) {
        evt.preventDefault();
        if (evt.type === 'DOMMouseScroll') {
          delta = delta * 40;
        }
        return this.search_results.scrollTop(delta + this.search_results.scrollTop());
      }
    };

    Chosen.prototype.blur_test = function(evt) {
      if (!this.active_field && this.container.hasClass("chzn-container-active")) {
        return this.close_field();
      }
    };

    Chosen.prototype.close_field = function() {
      $(document).unbind("click", this.click_test_action);
      this.active_field = false;
      this.results_hide();
      this.container.removeClass("chzn-container-active");
      this.winnow_results_clear();
      this.clear_backstroke();
      this.show_search_field_default();
      return this.search_field_scale();
    };

    Chosen.prototype.activate_field = function() {
      this.container.addClass("chzn-container-active");
      this.active_field = true;
      this.search_field.val(this.search_field.val());
      return this.search_field.focus();
    };

    Chosen.prototype.test_active_click = function(evt) {
      if ($(evt.target).parents('#' + this.container_id).length) {
        return this.active_field = true;
      } else {
        return this.close_field();
      }
    };

    Chosen.prototype.results_build = function() {
      var content, data, _i, _len, _ref;
      this.parsing = true;
      this.results_data = root.SelectParser.select_to_array(this.form_field);
      if (this.is_multiple && this.choices > 0) {
        this.search_choices.find("li.search-choice").remove();
        this.choices = 0;
      } else if (!this.is_multiple) {
        this.selected_item.addClass("chzn-default").find("span").text(this.default_text);
        if (this.disable_search || this.form_field.options.length <= this.disable_search_threshold) {
          this.container.addClass("chzn-container-single-nosearch");
        } else {
          this.container.removeClass("chzn-container-single-nosearch");
        }
      }
      content = '';
      _ref = this.results_data;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        data = _ref[_i];
        if (data.group) {
          content += this.result_add_group(data);
        } else if (!data.empty) {
          content += this.result_add_option(data);
          if (data.selected && this.is_multiple) {
            this.choice_build(data);
          } else if (data.selected && !this.is_multiple) {
            this.selected_item.removeClass("chzn-default").find("span").text(data.text);
            if (this.allow_single_deselect) {
              this.single_deselect_control_build();
            }
          }
        }
      }
      this.search_field_disabled();
      this.show_search_field_default();
      this.search_field_scale();
      this.search_results.html(content);
      return this.parsing = false;
    };

    Chosen.prototype.result_add_group = function(group) {
      if (!group.disabled) {
        group.dom_id = this.container_id + "_g_" + group.array_index;
        return '<li id="' + group.dom_id + '" class="group-result">' + $("<div />").text(group.label).html() + '</li>';
      } else {
        return "";
      }
    };

    Chosen.prototype.result_do_highlight = function(el) {
      var high_bottom, high_top, maxHeight, visible_bottom, visible_top;
      if (el.length) {
        this.result_clear_highlight();
        this.result_highlight = el;
        this.result_highlight.addClass("highlighted");
        maxHeight = parseInt(this.search_results.css("maxHeight"), 10);
        visible_top = this.search_results.scrollTop();
        visible_bottom = maxHeight + visible_top;
        high_top = this.result_highlight.position().top + this.search_results.scrollTop();
        high_bottom = high_top + this.result_highlight.outerHeight();
        if (high_bottom >= visible_bottom) {
          return this.search_results.scrollTop((high_bottom - maxHeight) > 0 ? high_bottom - maxHeight : 0);
        } else if (high_top < visible_top) {
          return this.search_results.scrollTop(high_top);
        }
      }
    };

    Chosen.prototype.result_clear_highlight = function() {
      if (this.result_highlight) {
        this.result_highlight.removeClass("highlighted");
      }
      return this.result_highlight = null;
    };

    Chosen.prototype.results_show = function() {
      if (this.result_single_selected != null) {
        this.result_do_highlight(this.result_single_selected);
      } else if (this.is_multiple && this.max_selected_options <= this.choices) {
        this.form_field_jq.trigger("liszt:maxselected", {
          chosen: this
        });
        return false;
      }
      this.container.addClass("chzn-with-drop");
      this.form_field_jq.trigger("liszt:showing_dropdown", {
        chosen: this
      });
      this.results_showing = true;
      this.search_field.focus();
      this.search_field.val(this.search_field.val());
      return this.winnow_results();
    };

    Chosen.prototype.results_hide = function() {
      this.result_clear_highlight();
      this.container.removeClass("chzn-with-drop");
      this.form_field_jq.trigger("liszt:hiding_dropdown", {
        chosen: this
      });
      return this.results_showing = false;
    };

    Chosen.prototype.set_tab_index = function(el) {
      var ti;
      if (this.form_field_jq.attr("tabindex")) {
        ti = this.form_field_jq.attr("tabindex");
        this.form_field_jq.attr("tabindex", -1);
        return this.search_field.attr("tabindex", ti);
      }
    };

    Chosen.prototype.set_label_behavior = function() {
      var _this = this;
      this.form_field_label = this.form_field_jq.parents("label");
      if (!this.form_field_label.length && this.form_field.id.length) {
        this.form_field_label = $("label[for=" + this.form_field.id + "]");
      }
      if (this.form_field_label.length > 0) {
        return this.form_field_label.click(function(evt) {
          if (_this.is_multiple) {
            return _this.container_mousedown(evt);
          } else {
            return _this.activate_field();
          }
        });
      }
    };

    Chosen.prototype.show_search_field_default = function() {
      if (this.is_multiple && this.choices < 1 && !this.active_field) {
        this.search_field.val(this.default_text);
        return this.search_field.addClass("default");
      } else {
        this.search_field.val("");
        return this.search_field.removeClass("default");
      }
    };

    Chosen.prototype.search_results_mouseup = function(evt) {
      var target;
      target = $(evt.target).hasClass("active-result") ? $(evt.target) : $(evt.target).parents(".active-result").first();
      if (target.length) {
        this.result_highlight = target;
        this.result_select(evt);
        return this.search_field.focus();
      }
    };

    Chosen.prototype.search_results_mouseover = function(evt) {
      var target;
      target = $(evt.target).hasClass("active-result") ? $(evt.target) : $(evt.target).parents(".active-result").first();
      if (target) {
        return this.result_do_highlight(target);
      }
    };

    Chosen.prototype.search_results_mouseout = function(evt) {
      if ($(evt.target).hasClass("active-result" || $(evt.target).parents('.active-result').first())) {
        return this.result_clear_highlight();
      }
    };

    Chosen.prototype.choice_build = function(item) {
      var choice_id, html, link,
        _this = this;
      if (this.is_multiple && this.max_selected_options <= this.choices) {
        this.form_field_jq.trigger("liszt:maxselected", {
          chosen: this
        });
        return false;
      }
      choice_id = this.container_id + "_c_" + item.array_index;
      this.choices += 1;
      if (item.disabled) {
        html = '<li class="search-choice search-choice-disabled" id="' + choice_id + '"><span>' + item.html + '</span></li>';
      } else {
        html = '<li class="search-choice" id="' + choice_id + '"><span>' + item.html + '</span><a href="javascript:void(0)" class="search-choice-close" rel="' + item.array_index + '"></a></li>';
      }
      this.search_container.before(html);
      link = $('#' + choice_id).find("a").first();
      return link.click(function(evt) {
        return _this.choice_destroy_link_click(evt);
      });
    };

    Chosen.prototype.choice_destroy_link_click = function(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      if (!this.is_disabled) {
        return this.choice_destroy($(evt.target));
      }
    };

    Chosen.prototype.choice_destroy = function(link) {
      if (this.result_deselect(link.attr("rel"))) {
        this.choices -= 1;
        this.show_search_field_default();
        if (this.is_multiple && this.choices > 0 && this.search_field.val().length < 1) {
          this.results_hide();
        }
        link.parents('li').first().remove();
        return this.search_field_scale();
      }
    };

    Chosen.prototype.results_reset = function() {
      this.form_field.options[0].selected = true;
      this.selected_item.find("span").text(this.default_text);
      if (!this.is_multiple) {
        this.selected_item.addClass("chzn-default");
      }
      this.show_search_field_default();
      this.results_reset_cleanup();
      this.form_field_jq.trigger("change");
      if (this.active_field) {
        return this.results_hide();
      }
    };

    Chosen.prototype.results_reset_cleanup = function() {
      this.current_selectedIndex = this.form_field.selectedIndex;
      return this.selected_item.find("abbr").remove();
    };

    Chosen.prototype.result_select = function(evt) {
      var high, high_id, item, position;
      if (this.result_highlight) {
        high = this.result_highlight;
        high_id = high.attr("id");
        this.result_clear_highlight();
        if (this.is_multiple) {
          this.result_deactivate(high);
        } else {
          this.search_results.find(".result-selected").removeClass("result-selected");
          this.result_single_selected = high;
          this.selected_item.removeClass("chzn-default");
        }
        high.addClass("result-selected");
        position = high_id.substr(high_id.lastIndexOf("_") + 1);
        item = this.results_data[position];
        item.selected = true;
        this.form_field.options[item.options_index].selected = true;
        if (this.is_multiple) {
          this.choice_build(item);
        } else {
          this.selected_item.find("span").first().text(item.text);
          if (this.allow_single_deselect) {
            this.single_deselect_control_build();
          }
        }
        if (!((evt.metaKey || evt.ctrlKey) && this.is_multiple)) {
          this.results_hide();
        }
        this.search_field.val("");
        if (this.is_multiple || this.form_field.selectedIndex !== this.current_selectedIndex) {
          this.form_field_jq.trigger("change", {
            'selected': this.form_field.options[item.options_index].value
          });
        }
        this.current_selectedIndex = this.form_field.selectedIndex;
        return this.search_field_scale();
      }
    };

    Chosen.prototype.result_activate = function(el) {
      return el.addClass("active-result");
    };

    Chosen.prototype.result_deactivate = function(el) {
      return el.removeClass("active-result");
    };

    Chosen.prototype.result_deselect = function(pos) {
      var result, result_data;
      result_data = this.results_data[pos];
      if (!this.form_field.options[result_data.options_index].disabled) {
        result_data.selected = false;
        this.form_field.options[result_data.options_index].selected = false;
        result = $("#" + this.container_id + "_o_" + pos);
        result.removeClass("result-selected").addClass("active-result").show();
        this.result_clear_highlight();
        this.winnow_results();
        this.form_field_jq.trigger("change", {
          deselected: this.form_field.options[result_data.options_index].value
        });
        this.search_field_scale();
        return true;
      } else {
        return false;
      }
    };

    Chosen.prototype.single_deselect_control_build = function() {
      if (this.allow_single_deselect && this.selected_item.find("abbr").length < 1) {
        return this.selected_item.find("span").first().after("<abbr class=\"search-choice-close\"></abbr>");
      }
    };

    Chosen.prototype.winnow_results = function() {
      var found, option, part, parts, regex, regexAnchor, result, result_id, results, searchText, startpos, text, zregex, _i, _j, _len, _len1, _ref;
      this.no_results_clear();
      results = 0;
      searchText = this.search_field.val() === this.default_text ? "" : $('<div/>').text($.trim(this.search_field.val())).html();
      regexAnchor = this.search_contains ? "" : "^";
      regex = new RegExp(regexAnchor + searchText.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), 'i');
      zregex = new RegExp(searchText.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), 'i');
      _ref = this.results_data;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        option = _ref[_i];
        if (!option.disabled && !option.empty) {
          if (option.group) {
            $('#' + option.dom_id).css('display', 'none');
          } else if (!(this.is_multiple && option.selected)) {
            found = false;
            result_id = option.dom_id;
            result = $("#" + result_id);
            if (regex.test(option.html)) {
              found = true;
              results += 1;
            } else if (this.enable_split_word_search && (option.html.indexOf(" ") >= 0 || option.html.indexOf("[") === 0)) {
              parts = option.html.replace(/\[|\]/g, "").split(" ");
              if (parts.length) {
                for (_j = 0, _len1 = parts.length; _j < _len1; _j++) {
                  part = parts[_j];
                  if (regex.test(part)) {
                    found = true;
                    results += 1;
                  }
                }
              }
            }
            if (found) {
              if (searchText.length) {
                startpos = option.html.search(zregex);
                text = option.html.substr(0, startpos + searchText.length) + '</em>' + option.html.substr(startpos + searchText.length);
                text = text.substr(0, startpos) + '<em>' + text.substr(startpos);
              } else {
                text = option.html;
              }
              result.html(text);
              this.result_activate(result);
              if (option.group_array_index != null) {
                $("#" + this.results_data[option.group_array_index].dom_id).css('display', 'list-item');
              }
            } else {
              if (this.result_highlight && result_id === this.result_highlight.attr('id')) {
                this.result_clear_highlight();
              }
              this.result_deactivate(result);
            }
          }
        }
      }
      if (results < 1 && searchText.length) {
        return this.no_results(searchText);
      } else {
        return this.winnow_results_set_highlight();
      }
    };

    Chosen.prototype.winnow_results_clear = function() {
      var li, lis, _i, _len, _results;
      this.search_field.val("");
      lis = this.search_results.find("li");
      _results = [];
      for (_i = 0, _len = lis.length; _i < _len; _i++) {
        li = lis[_i];
        li = $(li);
        if (li.hasClass("group-result")) {
          _results.push(li.css('display', 'auto'));
        } else if (!this.is_multiple || !li.hasClass("result-selected")) {
          _results.push(this.result_activate(li));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Chosen.prototype.winnow_results_set_highlight = function() {
      var do_high, selected_results;
      if (!this.result_highlight) {
        selected_results = !this.is_multiple ? this.search_results.find(".result-selected.active-result") : [];
        do_high = selected_results.length ? selected_results.first() : this.search_results.find(".active-result").first();
        if (do_high != null) {
          return this.result_do_highlight(do_high);
        }
      }
    };

    Chosen.prototype.no_results = function(terms) {
      var no_results_html;
      no_results_html = $('<li class="no-results">' + this.results_none_found + ' "<span></span>"</li>');
      no_results_html.find("span").first().html(terms);
      return this.search_results.append(no_results_html);
    };

    Chosen.prototype.no_results_clear = function() {
      return this.search_results.find(".no-results").remove();
    };

    Chosen.prototype.keydown_arrow = function() {
      var first_active, next_sib;
      if (!this.result_highlight) {
        first_active = this.search_results.find("li.active-result").first();
        if (first_active) {
          this.result_do_highlight($(first_active));
        }
      } else if (this.results_showing) {
        next_sib = this.result_highlight.nextAll("li.active-result").first();
        if (next_sib) {
          this.result_do_highlight(next_sib);
        }
      }
      if (!this.results_showing) {
        return this.results_show();
      }
    };

    Chosen.prototype.keyup_arrow = function() {
      var prev_sibs;
      if (!this.results_showing && !this.is_multiple) {
        return this.results_show();
      } else if (this.result_highlight) {
        prev_sibs = this.result_highlight.prevAll("li.active-result");
        if (prev_sibs.length) {
          return this.result_do_highlight(prev_sibs.first());
        } else {
          if (this.choices > 0) {
            this.results_hide();
          }
          return this.result_clear_highlight();
        }
      }
    };

    Chosen.prototype.keydown_backstroke = function() {
      var next_available_destroy;
      if (this.pending_backstroke) {
        this.choice_destroy(this.pending_backstroke.find("a").first());
        return this.clear_backstroke();
      } else {
        next_available_destroy = this.search_container.siblings("li.search-choice").last();
        if (next_available_destroy.length && !next_available_destroy.hasClass("search-choice-disabled")) {
          this.pending_backstroke = next_available_destroy;
          if (this.single_backstroke_delete) {
            return this.keydown_backstroke();
          } else {
            return this.pending_backstroke.addClass("search-choice-focus");
          }
        }
      }
    };

    Chosen.prototype.clear_backstroke = function() {
      if (this.pending_backstroke) {
        this.pending_backstroke.removeClass("search-choice-focus");
      }
      return this.pending_backstroke = null;
    };

    Chosen.prototype.keydown_checker = function(evt) {
      var stroke, _ref;
      stroke = (_ref = evt.which) != null ? _ref : evt.keyCode;
      this.search_field_scale();
      if (stroke !== 8 && this.pending_backstroke) {
        this.clear_backstroke();
      }
      switch (stroke) {
        case 8:
          this.backstroke_length = this.search_field.val().length;
          break;
        case 9:
          if (this.results_showing && !this.is_multiple) {
            this.result_select(evt);
          }
          this.mouse_on_container = false;
          break;
        case 13:
          evt.preventDefault();
          break;
        case 38:
          evt.preventDefault();
          this.keyup_arrow();
          break;
        case 40:
          this.keydown_arrow();
          break;
      }
    };

    Chosen.prototype.search_field_scale = function() {
      var div, h, style, style_block, styles, w, _i, _len;
      if (this.is_multiple) {
        h = 0;
        w = 0;
        style_block = "position:absolute; left: -1000px; top: -1000px; display:none;";
        styles = ['font-size', 'font-style', 'font-weight', 'font-family', 'line-height', 'text-transform', 'letter-spacing'];
        for (_i = 0, _len = styles.length; _i < _len; _i++) {
          style = styles[_i];
          style_block += style + ":" + this.search_field.css(style) + ";";
        }
        div = $('<div />', {
          'style': style_block
        });
        div.text(this.search_field.val());
        $('body').append(div);
        w = div.width() + 25;
        div.remove();
        if (!this.f_width) {
          this.f_width = this.container.outerWidth();
        }
        if (w > this.f_width - 10) {
          w = this.f_width - 10;
        }
        return this.search_field.css({
          'width': w + 'px'
        });
      }
    };

    Chosen.prototype.generate_random_id = function() {
      var string;
      string = "sel" + this.generate_random_char() + this.generate_random_char() + this.generate_random_char();
      while ($("#" + string).length > 0) {
        string += this.generate_random_char();
      }
      return string;
    };

    return Chosen;

  })(AbstractChosen);

  root.Chosen = Chosen;

}).call(this);(function(a) {
    a.fn.slider = function(b) {
        function H() {
            I(b.startingSlide);
            if (b.mode == "horizontal") {
                e.wrap('<div class="' + b.wrapperClass + '" style="width:' + l + 'px; position:relative;"></div>').wrap('<div class="bx-window" style="position:relative; overflow:hidden; width:' + l + 'px;"></div>').css({width: "999999px",position: "relative",left: "-" + (b.infiniteLoop ? y : 0) + "px"});
                e.children(b.childSelector).css({width: j,"float": "left",listStyle: "none"});
                h = e.parent().parent();
                g.addClass("bx-child")
            } else if (b.mode == "vertical") {
                e.wrap('<div class="' + b.wrapperClass + '" style="width:' + v + 'px; position:relative;"></div>').wrap('<div class="bx-window" style="width:' + v + "px; height:" + m + 'px; position:relative; overflow:hidden;"></div>').css({height: "999999px",position: "relative",top: "-" + z + "px"});
                e.children(b.childSelector).css({listStyle: "none",height: w});
                h = e.parent().parent();
                g.addClass("bx-child")
            } else if (b.mode == "fade") {
                e.wrap('<div class="' + b.wrapperClass + '" style="width:' + v + 'px; position:relative;"></div>').wrap('<div class="bx-window" style="height:' + w + "px; width:" + v + 'px; position:relative; overflow:hidden;"></div>');
                e.children(b.childSelector).css({listStyle: "none",position: "absolute",top: 0,left: 0,zIndex: 98});
                h = e.parent().parent();
                g.not(":eq(" + x + ")").fadeTo(0, 0);
                g.eq(x).css("zIndex", 99)
            }
            if (b.captions && b.captionsSelector == null) {
                h.append('<div class="bx-captions"></div>')
            }
        }
        function I() {
            if ((b.mode == "horizontal" || b.mode == "vertical") && b.infiniteLoop) {
                var c = Z(g, 0, b.moveSlideQty, "backward");
                a.each(c, function(b) {
                    e.prepend(a(this))
                });
                var d = g.length + b.moveSlideQty - 1;
                var f = g.length - b.displaySlideQty;
                var h = d - f;
                var i = Z(g, 0, h, "forward");
                if (b.infiniteLoop) {
                    a.each(i, function(b) {
                        e.append(a(this))
                    })
                }
            }
        }
        function J() {
            if (b.nextImage != "") {
                nextContent = b.nextImage;
                nextType = "image"
            } else {
                nextContent = b.nextText;
                nextType = "text"
            }
            if (b.prevImage != "") {
                prevContent = b.prevImage;
                prevType = "image"
            } else {
                prevContent = b.prevText;
                prevType = "text"
            }
            R(nextType, nextContent, prevType, prevContent)
        }
        function K() {
            if (b.auto) {
                clearInterval(o);
                if (!b.infiniteLoop) {
                    if (b.autoDirection == "next") {
                        o = setInterval(function() {
                            x += b.moveSlideQty;
                            if (x > G) {
                                x = x % g.length
                            }
                            d.goToSlide(x, false)
                        }, b.pause)
                    } else if (b.autoDirection == "prev") {
                        o = setInterval(function() {
                            x -= b.moveSlideQty;
                            if (x < 0) {
                                negativeOffset = x % g.length;
                                if (negativeOffset == 0) {
                                    x = 0
                                } else {
                                    x = g.length + negativeOffset
                                }
                            }
                            d.goToSlide(x, false)
                        }, b.pause)
                    }
                } else {
                    if (b.autoDirection == "next") {
                        o = setInterval(function() {
                            d.goToNextSlide(false)
                        }, b.pause)
                    } else if (b.autoDirection == "prev") {
                        o = setInterval(function() {
                            d.goToPreviousSlide(false)
                        }, b.pause)
                    }
                }
            } else if (b.ticker) {
                b.tickerSpeed *= 10;
                a(".bx-child", h).each(function(b) {
                    A += a(this).width();
                    B += a(this).height()
                });
                if (b.tickerDirection == "prev" && b.mode == "horizontal") {
                    e.css("left", "-" + (A + y) + "px")
                } else if (b.tickerDirection == "prev" && b.mode == "vertical") {
                    e.css("top", "-" + (B + z) + "px")
                }
                if (b.mode == "horizontal") {
                    C = parseInt(e.css("left"));
                    L(C, A, b.tickerSpeed)
                } else if (b.mode == "vertical") {
                    D = parseInt(e.css("top"));
                    L(D, B, b.tickerSpeed)
                }
                if (b.tickerHover) {
                    O()
                }
            }
        }
        function L(a, c, d) {
            if (b.mode == "horizontal") {
                if (b.tickerDirection == "next") {
                    e.animate({left: "-=" + c + "px"}, d, "linear", function() {
                        e.css("left", a);
                        L(a, A, b.tickerSpeed)
                    })
                } else if (b.tickerDirection == "prev") {
                    e.animate({left: "+=" + c + "px"}, d, "linear", function() {
                        e.css("left", a);
                        L(a, A, b.tickerSpeed)
                    })
                }
            } else if (b.mode == "vertical") {
                if (b.tickerDirection == "next") {
                    e.animate({top: "-=" + c + "px"}, d, "linear", function() {
                        e.css("top", a);
                        L(a, B, b.tickerSpeed)
                    })
                } else if (b.tickerDirection == "prev") {
                    e.animate({top: "+=" + c + "px"}, d, "linear", function() {
                        e.css("top", a);
                        L(a, B, b.tickerSpeed)
                    })
                }
            }
        }
        function M() {
            if (b.startImage != "") {
                startContent = b.startImage;
                startType = "image"
            } else {
                startContent = b.startText;
                startType = "text"
            }
            if (b.stopImage != "") {
                stopContent = b.stopImage;
                stopType = "image"
            } else {
                stopContent = b.stopText;
                stopType = "text"
            }
            U(startType, startContent, stopType, stopContent)
        }
        function N() {
            h.children(".bx-window").hover(function() {
                if (t) {
                    d.suspendShow(false)
                }
            }, function() {
                if (t) {
                    d.restartShow(false)
                }
            })
        }
        function O() {
            e.hover(function() {
                if (t) {
                    d.stopTicker(false)
                }
            }, function() {
                if (t) {
                    d.startTicker(false)
                }
            })
        }
        function P() {
            g.not(":eq(" + x + ")").fadeTo(b.speed, 0).css("zIndex", 98);
            g.eq(x).css("zIndex", 99).fadeTo(b.speed, 1, function() {
                E = false;
                if (jQuery.browser.msie) {
                    g.eq(x).get(0).style.removeAttribute("filter")
                }
                b.onAfterSlide(x, g.length, g.eq(x))
            })
        }
        function Q(c) {
            if (b.pagerType == "full" && b.pager) {
                a("a", n).removeClass(b.pagerActiveClass);
                a("a", n).eq(c).addClass(b.pagerActiveClass)
            } else if (b.pagerType == "short" && b.pager) {
                a(".bx-pager-current", n).html(x + 1)
            }
        }
        function R(c, e, f, g) {
            var i = a('<a href="" class="bx-next"></a>');
            var j = a('<a href="" class="bx-prev"></a>');
            if (c == "text") {
                i.html(e)
            } else {
                i.html('<img src="' + e + '" />')
            }
            if (f == "text") {
                j.html(g)
            } else {
                j.html('<img src="' + g + '" />')
            }
            if (b.prevSelector) {
                a(b.prevSelector).append(j)
            } else {
                h.append(j)
            }
            if (b.nextSelector) {
                a(b.nextSelector).append(i)
            } else {
                h.append(i)
            }
            i.click(function() {
                d.goToNextSlide();
                return false
            });
            j.click(function() {
                d.goToPreviousSlide();
                return false
            })
        }
        function S(c) {
            var e = g.length;
            if (b.moveSlideQty > 1) {
                if (g.length % b.moveSlideQty != 0) {
                    e = Math.ceil(g.length / b.moveSlideQty)
                } else {
                    e = g.length / b.moveSlideQty
                }
            }
            var f = "";
            if (b.buildPager) {
                for (var i = 0; i < e; i++) {
                    f += b.buildPager(i, g.eq(i * b.moveSlideQty))
                }
            } else if (c == "full") {
                for (var i = 1; i <= e; i++) {
                    f += '<a href="" class="pager-link pager-' + i + '">' + i + "</a>"
                }
            } else if (c == "short") {
                f = '<span class="bx-pager-current">' + (b.startingSlide + 1) + "</span> " + b.pagerShortSeparator + ' <span class="bx-pager-total">' + g.length + "</span>"
            }
            if (b.pagerSelector) {
                a(b.pagerSelector).append(f);
                n = a(b.pagerSelector)
            } else {
                var j = a('<div class="bx-pager"></div>');
                j.append(f);
                if (b.pagerLocation == "top") {
                    h.prepend(j)
                } else if (b.pagerLocation == "bottom") {
                    h.append(j)
                }
                n = h.children(".bx-pager")
            }
            n.children().click(function() {
                if (b.pagerType == "full") {
                    var a = n.children().index(this);
                    if (b.moveSlideQty > 1) {
                        a *= b.moveSlideQty
                    }
                    d.goToSlide(a)
                }
                return false
            })
        }
        function T() {
            var c = a("img", g.eq(x)).attr("title");
            if (c != "") {
                if (b.captionsSelector) {
                    a(b.captionsSelector).html(c)
                } else {
                    h.children(".bx-captions").html(c)
                }
            } else {
                if (b.captionsSelector) {
                    a(b.captionsSelector).html(" ")
                } else {
                    h.children(".bx-captions").html(" ")
                }
            }
        }
        function U(c, e, f, g) {
            p = a('<a href="" class="bx-start"></a>');
            if (c == "text") {
                r = e
            } else {
                r = '<img src="' + e + '" />'
            }
            if (f == "text") {
                s = g
            } else {
                s = '<img src="' + g + '" />'
            }
            if (b.autoControlsSelector) {
                a(b.autoControlsSelector).append(p)
            } else {
                h.append('<div class="bx-auto"></div>');
                h.children(".bx-auto").html(p)
            }
            p.click(function() {
                if (b.ticker) {
                    if (a(this).hasClass("stop")) {
                        d.stopTicker()
                    } else if (a(this).hasClass("start")) {
                        d.startTicker()
                    }
                } else {
                    if (a(this).hasClass("stop")) {
                        d.stopShow(true)
                    } else if (a(this).hasClass("start")) {
                        d.startShow(true)
                    }
                }
                return false
            })
        }
        function V() {
            if (!b.infiniteLoop && b.hideControlOnEnd) {
                if (x == F) {
                    h.children(".bx-prev").hide()
                } else {
                    h.children(".bx-prev").show()
                }
                var a = Math.floor(G / b.displaySlideQty) * b.displaySlideQty;
                if (x >= a) {
                    h.children(".bx-next").hide()
                } else {
                    h.children(".bx-next").show()
                }
            }
        }
        function W(a, b) {
            var c = e.find(" > .bx-child").eq(a).position();
            return b == "left" ? c.left : c.top
        }
        function X() {
            var a = i.outerWidth() * b.displaySlideQty;
            return a
        }
        function Y() {
            var a = i.outerHeight() * b.displaySlideQty;
            return a
        }
        function Z(b, c, d, e) {
            var f = [];
            var g = d;
            var h = false;
            if (e == "backward") {
                b = a.makeArray(b);
                b.reverse()
            }
            while (g > 0) {
                a.each(b, function(b, d) {
                    if (g > 0) {
                        if (!h) {
                            if (b == c) {
                                h = true;
                                f.push(a(this).clone());
                                g--
                            }
                        } else {
                            f.push(a(this).clone());
                            g--
                        }
                    } else {
                        return false
                    }
                })
            }
            return f
        }
        var c = {mode: "horizontal",childSelector: "",infiniteLoop: true,hideControlOnEnd: false,controls: true,speed: 500,easing: "swing",pager: false,pagerSelector: null,pagerType: "full",pagerLocation: "bottom",pagerShortSeparator: "/",pagerActiveClass: "pager-active",nextText: "next",nextImage: "",nextSelector: null,prevText: "prev",prevImage: "",prevSelector: null,captions: false,captionsSelector: null,auto: false,autoDirection: "next",autoControls: false,autoControlsSelector: null,autoStart: true,autoHover: false,autoDelay: 0,pause: 3e3,startText: "start",startImage: "",stopText: "stop",stopImage: "",ticker: false,tickerSpeed: 5e3,tickerDirection: "next",tickerHover: false,wrapperClass: "bx-wrapper",startingSlide: 0,displaySlideQty: 1,moveSlideQty: 1,randomStart: false,onBeforeSlide: function() {
            },onAfterSlide: function() {
            },onLastSlide: function() {
            },onFirstSlide: function() {
            },onNextSlide: function() {
            },onPrevSlide: function() {
            },buildPager: null};
        var b = a.extend(c, b);
        var d = this;
        var e = "";
        var f = "";
        var g = "";
        var h = "";
        var i = "";
        var j = "";
        var k = "";
        var l = "";
        var m = "";
        var n = "";
        var o = "";
        var p = "";
        var q = "";
        var r = "";
        var s = "";
        var t = true;
        var u = false;
        var v = 0;
        var w = 0;
        var x = 0;
        var y = 0;
        var z = 0;
        var A = 0;
        var B = 0;
        var C = 0;
        var D = 0;
        var E = false;
        var F = 0;
        var G = g.length - 1;
        this.goToSlide = function(a, c) {
            if (!E) {
                E = true;
                x = a;
                b.onBeforeSlide(x, g.length, g.eq(x));
                if (typeof c == "undefined") {
                    var c = true
                }
                if (c) {
                    if (b.auto) {
                        d.stopShow(true)
                    }
                }
                slide = a;
                if (slide == F) {
                    b.onFirstSlide(x, g.length, g.eq(x))
                }
                if (slide == G) {
                    b.onLastSlide(x, g.length, g.eq(x))
                }
                if (b.mode == "horizontal") {
                    e.animate({left: "-" + W(slide, "left") + "px"}, b.speed, b.easing, function() {
                        E = false;
                        b.onAfterSlide(x, g.length, g.eq(x))
                    })
                } else if (b.mode == "vertical") {
                    e.animate({top: "-" + W(slide, "top") + "px"}, b.speed, b.easing, function() {
                        E = false;
                        b.onAfterSlide(x, g.length, g.eq(x))
                    })
                } else if (b.mode == "fade") {
                    P()
                }
                V();
                if (b.moveSlideQty > 1) {
                    a = Math.floor(a / b.moveSlideQty)
                }
                Q(a);
                T()
            }
        };
        this.goToNextSlide = function(a) {
            if (typeof a == "undefined") {
                var a = true
            }
            if (a) {
                if (b.auto) {
                    d.stopShow(true)
                }
            }
            if (!b.infiniteLoop) {
                if (!E) {
                    var c = false;
                    x = x + b.moveSlideQty;
                    if (x <= G) {
                        V();
                        b.onNextSlide(x, g.length, g.eq(x));
                        d.goToSlide(x)
                    } else {
                        x -= b.moveSlideQty
                    }
                }
            } else {
                if (!E) {
                    E = true;
                    var c = false;
                    x = x + b.moveSlideQty;
                    if (x > G) {
                        x = x % g.length;
                        c = true
                    }
                    b.onNextSlide(x, g.length, g.eq(x));
                    b.onBeforeSlide(x, g.length, g.eq(x));
                    if (b.mode == "horizontal") {
                        var f = b.moveSlideQty * k;
                        e.animate({left: "-=" + f + "px"}, b.speed, b.easing, function() {
                            E = false;
                            if (c) {
                                e.css("left", "-" + W(x, "left") + "px")
                            }
                            b.onAfterSlide(x, g.length, g.eq(x))
                        })
                    } else if (b.mode == "vertical") {
                        var h = b.moveSlideQty * w;
                        e.animate({top: "-=" + h + "px"}, b.speed, b.easing, function() {
                            E = false;
                            if (c) {
                                e.css("top", "-" + W(x, "top") + "px")
                            }
                            b.onAfterSlide(x, g.length, g.eq(x))
                        })
                    } else if (b.mode == "fade") {
                        P()
                    }
                    if (b.moveSlideQty > 1) {
                        Q(Math.ceil(x / b.moveSlideQty))
                    } else {
                        Q(x)
                    }
                    T()
                }
            }
        };
        this.goToPreviousSlide = function(a) {
            if (typeof a == "undefined") {
                var a = true
            }
            if (a) {
                if (b.auto) {
                    d.stopShow(true)
                }
            }
            if (!b.infiniteLoop) {
                if (!E) {
                    var c = false;
                    x = x - b.moveSlideQty;
                    if (x < 0) {
                        x = 0;
                        if (b.hideControlOnEnd) {
                            h.children(".bx-prev").hide()
                        }
                    }
                    V();
                    b.onPrevSlide(x, g.length, g.eq(x));
                    d.goToSlide(x)
                }
            } else {
                if (!E) {
                    E = true;
                    var c = false;
                    x = x - b.moveSlideQty;
                    if (x < 0) {
                        negativeOffset = x % g.length;
                        if (negativeOffset == 0) {
                            x = 0
                        } else {
                            x = g.length + negativeOffset
                        }
                        c = true
                    }
                    b.onPrevSlide(x, g.length, g.eq(x));
                    b.onBeforeSlide(x, g.length, g.eq(x));
                    if (b.mode == "horizontal") {
                        var f = b.moveSlideQty * k;
                        e.animate({left: "+=" + f + "px"}, b.speed, b.easing, function() {
                            E = false;
                            if (c) {
                                e.css("left", "-" + W(x, "left") + "px")
                            }
                            b.onAfterSlide(x, g.length, g.eq(x))
                        })
                    } else if (b.mode == "vertical") {
                        var i = b.moveSlideQty * w;
                        e.animate({top: "+=" + i + "px"}, b.speed, b.easing, function() {
                            E = false;
                            if (c) {
                                e.css("top", "-" + W(x, "top") + "px")
                            }
                            b.onAfterSlide(x, g.length, g.eq(x))
                        })
                    } else if (b.mode == "fade") {
                        P()
                    }
                    if (b.moveSlideQty > 1) {
                        Q(Math.ceil(x / b.moveSlideQty))
                    } else {
                        Q(x)
                    }
                    T()
                }
            }
        };
        this.goToFirstSlide = function(a) {
            if (typeof a == "undefined") {
                var a = true
            }
            d.goToSlide(F, a)
        };
        this.goToLastSlide = function() {
            if (typeof a == "undefined") {
                var a = true
            }
            d.goToSlide(G, a)
        };
        this.getCurrentSlide = function() {
            return x
        };
        this.getSlideCount = function() {
            return g.length
        };
        this.suspendShow = function(a) {
            clearInterval(o);
            if (typeof a == "undefined") {
                var a = true
            }
            if (a && b.autoControls) {
                p.html(r).removeClass("stop").addClass("start")
            }
        };
        this.restartShow = function(a) {
            if (typeof a == "undefined") {
                var a = true
            }
            if (t) {
                K()
            }
            if (a && b.autoControls) {
                p.html(s).removeClass("start").addClass("stop")
            }
        };
        this.stopShow = function(a) {
            t = false;
            this.suspendShow(a)
        };
        this.startShow = function(a) {
            t = true;
            this.restartShow(a)
        };
        this.stopTicker = function(a) {
            e.stop();
            if (typeof a == "undefined") {
                var a = true
            }
            if (a && b.ticker) {
                p.html(r).removeClass("stop").addClass("start");
                t = false
            }
        };
        this.startTicker = function(a) {
            if (b.mode == "horizontal") {
                if (b.tickerDirection == "next") {
                    var c = parseInt(e.css("left"));
                    var d = A + c + g.eq(0).width()
                } else if (b.tickerDirection == "prev") {
                    var c = -parseInt(e.css("left"));
                    var d = c - g.eq(0).width()
                }
                var f = d * b.tickerSpeed / A;
                L(C, d, f)
            } else if (b.mode == "vertical") {
                if (b.tickerDirection == "next") {
                    var h = parseInt(e.css("top"));
                    var d = B + h + g.eq(0).height()
                } else if (b.tickerDirection == "prev") {
                    var h = -parseInt(e.css("top"));
                    var d = h - g.eq(0).height()
                }
                var f = d * b.tickerSpeed / B;
                L(D, d, f);
                if (typeof a == "undefined") {
                    var a = true
                }
                if (a && b.ticker) {
                    p.html(s).removeClass("start").addClass("stop");
                    t = true
                }
            }
        };
        this.initShow = function() {
            e = a(this);
            f = e.clone();
            g = e.children(b.childSelector);
            h = "";
            i = e.children(b.childSelector + ":first");
            j = i.width();
            v = 0;
            k = i.outerWidth();
            w = 0;
            l = X();
            m = Y();
            E = false;
            n = "";
            x = 0;
            y = 0;
            z = 0;
            o = "";
            p = "";
            q = "";
            r = "";
            s = "";
            t = true;
            u = false;
            A = 0;
            B = 0;
            C = 0;
            D = 0;
            F = 0;
            G = g.length - 1;
            g.each(function(b) {
                if (a(this).outerHeight() > w) {
                    w = a(this).outerHeight()
                }
                if (a(this).outerWidth() > v) {
                    v = a(this).outerWidth()
                }
            });
            if (b.randomStart) {
                var c = Math.floor(Math.random() * g.length);
                x = c;
                y = k * (b.moveSlideQty + c);
                z = w * (b.moveSlideQty + c)
            } else {
                x = b.startingSlide;
                y = k * (b.moveSlideQty + b.startingSlide);
                z = w * (b.moveSlideQty + b.startingSlide)
            }
            H();
            if (b.pager && !b.ticker) {
                if (b.pagerType == "full") {
                    S("full")
                } else if (b.pagerType == "short") {
                    S("short")
                }
            }
            if (b.controls && !b.ticker && g.length > 1) {
                J()
            }
            if (b.auto || b.ticker) {
                if (b.autoControls) {
                    M()
                }
                if (b.autoStart) {
                    t = false;
                    setTimeout(function() {
                        d.startShow(true)
                    }, b.autoDelay)
                } else {
                    d.stopShow(true)
                }
                if (b.autoHover && !b.ticker) {
                    N()
                }
            }
            if (b.moveSlideQty > 1) {
                Q(Math.ceil(x / b.moveSlideQty))
            } else {
                Q(x)
            }
            V();
            if (b.captions) {
                T()
            }
            b.onAfterSlide(x, g.length, g.eq(x))
        };
        this.destroyShow = function() {
            clearInterval(o);
            h.children(".bx-next, .bx-prev, .bx-pager, .bx-auto").remove();
            e.unwrap().unwrap().removeAttr("style");
            e.children(b.childSelector).removeAttr("style").not(".bx-child").remove();
            g.removeClass("bx-child")
        };
        this.reloadShow = function() {
            d.destroyShow();
            d.initShow()
        };
        this.each(function() {
            if (a(this).children().length > 0) {
                d.initShow()
            }
        });
        return this
    };
    jQuery.fx.prototype.cur = function() {
        if (this.elem[this.prop] != null && (!this.elem.style || this.elem.style[this.prop] == null)) {
            return this.elem[this.prop]
        }
        var a = parseFloat(jQuery.css(this.elem, this.prop));
        return a
    }
})(jQuery);;(function($) {
	$.fn.AjaxFileUpload = function(options) {
		
		var defaults = {
			action:     siteUrl+"backdoor/ajax-upload.php",
			onChange:   function(filename) {},
			onSubmit:   function(filename) {},
			onComplete: function(filename, response) {}
		},
		settings = $.extend({}, defaults, options),
		randomId = (function() {
			var id = 0;
			return function () {
				return "_AjaxFileUpload" + id++;
			};
		})();
		
		return this.each(function() {
			var $this = $(this);
			if ($this.is("input") && $this.attr("type") === "file") {
				$this.bind("change", onChange);
			}
		});
		
		function onChange(e) {
			var $element = $(e.target),
				id       = $element.attr('id'),
				$clone   = $element.removeAttr('id').clone().attr('id', id).AjaxFileUpload(options),
				filename = $element.val().replace(/.*(\/|\\)/, ""),
				iframe   = createIframe(),
				form     = createForm(iframe);

			// We append a clone since the original input will be destroyed
			$clone.insertBefore($element);
			settings.onChange.call($clone[0], filename);

			iframe.bind("load", {element: $clone, form: form, filename: filename}, onComplete);
			
			form.append($element).bind("submit", {element: $clone, iframe: iframe, filename: filename}, onSubmit).submit();
		}
		
		function onSubmit(e) {
			var data = settings.onSubmit.call(e.data.element, e.data.filename);

			// If false cancel the submission
			if (data === false) {
				// Remove the temporary form and iframe
				$(e.target).remove();
				e.data.iframe.remove();
				return false;
			} else {
				// Else, append additional inputs
				for (var variable in data) {
					$("<input />")
						.attr("type", "hidden")
						.attr("name", variable)
						.val(data[variable])
						.appendTo(e.target);
				}
			}
		}
		
		function onComplete (e) {
			var $iframe  = $(e.target),
				doc      = ($iframe[0].contentWindow || $iframe[0].contentDocument).document,
				response = doc.body.innerHTML;

			if (response) {
				response = $.parseJSON(response);
			} else {
				response = {};
			}

			settings.onComplete.call(e.data.element, e.data.filename, response);
			
			// Remove the temporary form and iframe
			e.data.form.remove();
			$iframe.remove();
		}

		function createIframe() {
			var id = randomId();

			// The iframe must be appended as a string otherwise IE7 will pop up the response in a new window
			// http://stackoverflow.com/a/6222471/268669
			$("body")
				.append('<iframe src="javascript:false;" name="' + id + '" id="' + id + '" style="display: none;"></iframe>');

			return $('#' + id);
		}
		
		function createForm(iframe) {
			return $("<form />")
				.attr({
					method: "post",
					action: settings.action,
					enctype: "multipart/form-data",
					target: iframe[0].name
				})
				.hide()
				.appendTo("body");
		}
	};
})(jQuery);function update_weather(){
	$.ajax({
	  url: siteUrl+"apis/weather.php",
	  type: "GET",
	}).done(function(data) {
		console.log(data);
		weather = JSON.parse(data);
		$('.now-icon').html(weather.now_icon);
		$('.now-temp').html(weather.now_temperature+'<sup>&deg;</sup>');
		$('.now-low').html(weather.now_low+'<sup>&deg;</sup>');
		$('.now-high').html(weather.now_high+'<sup>&deg;</sup>');
		
		$('.next-hour').html(weather.next_hour_icon+weather.next_hour_temperature+'<sup>&deg;</sup>');
		$('.tomorrow').html(weather.tomorrow_icon+weather.tomorrow_temperature+'<sup>&deg;</sup>');
		$('.two-days').html(weather.next_icon+weather.next_temperature+'<sup>&deg;</sup>');
		$('.updated-datetime').html('Last updated:'+weather.date);
	});	
}

function sortSelect(selElem) {
	if (selElem.children('optgroup').length){
		selElem.children('optgroup').each(function(){
			var $optgroup = $(this);
			var tmpAry = new Array();
			$optgroup.children('option').each(function(index){
		        tmpAry[index] = new Array();
		        tmpAry[index][0] = $(this).html();
		        tmpAry[index][1] = $(this).attr('value');
			});
		    tmpAry.sort();
			$optgroup.empty();
		    for (var i=0;i<tmpAry.length;i++) {
		        $optgroup.append('<option value="'+tmpAry[i][1]+'">'+tmpAry[i][0]+'</option>');
		    }
		});
	} else {
		var tmpAry = new Array();
		selElem.children('option').each(function(index){
	        tmpAry[index] = new Array();
	        tmpAry[index][0] = $(this).html();
	        tmpAry[index][1] = $(this).attr('value');
			tmpAry[index][2] = false;
			if ($(this).attr('selected')=='selected'){
				tmpAry[index][2] = true;
			}
		});
	    tmpAry.sort();
		selElem.empty();
	    for (var i=0;i<tmpAry.length;i++) {
			if (tmpAry[i][2]){
	 	       selElem.append('<option value="'+tmpAry[i][1]+'" selected="selected">'+tmpAry[i][0]+'</option>');
			} else {
 	 	       selElem.append('<option value="'+tmpAry[i][1]+'">'+tmpAry[i][0]+'</option>');
			}
	    }
		selElem.chosen().trigger("liszt:updated");
	}
}

$(document).ready(function(){
	
	// wallboard functions
	  
	if ($('.photos-slider').length){
		var images = document.getElementById('slideshow').getElementsByTagName('img'),
			numberOfImages = images.length,
			i = 1;
		function kenBurns() {
			if (i==numberOfImages){ 
				i = 0;
			}
			images[i].className = "fx";
			if (i===0){ 
				images[numberOfImages-2].className = "";
			}
			if (i===1){ 
				images[numberOfImages-1].className = "";
			}
			if (i>1){ 
				images[i-2].className = "";
			}
			i++;
		}
		document.getElementById('slideshow').getElementsByTagName('img')[0].className = "fx";
		window.setInterval(kenBurns, 5000);
	}
	
	if ($('.wallboard').length){
		// load weather array
		update_weather();
		window.setInterval(update_weather, 5000);
	}
	
	
	// backdoor functions
	if ($(".chzn-edit-tags").length){
		$(".chzn-edit-tags").each(function(){
			var id= $(this).attr('id');
			sortSelect($("#"+id));
		});
	}
	
	// profile edit tags change
	$(".chzn-edit-tags").chosen().change(function(){
		var selected = $(this).val();
		var this_cleaning_day_id = $(this).attr('name');
		
		$.ajax({
		  url: siteUrl+"backdoor/ajax-remove_cleaning.php",
		  type: "POST",
		  data: { cleaning_day_id: this_cleaning_day_id },
		}).done(function(data) {
			for (var i=0;i<selected.length;i++){
				$.ajax({
				  url: siteUrl+"backdoor/ajax-update_cleaning.php",
				  type: "POST",
				  data: { user_id: selected[i], cleaning_day_id: this_cleaning_day_id },
				}).done(function(data) {
				});
			}
		});
	});
	
	$('.options').bind('keyup', function(){
		$(this).removeClass('success');
	});
	
	$('.options').bind('change', function(){
		var $this_input = $(this);
		var this_content = $(this).val();
		var this_name = $(this).attr('name');
		
		$.ajax({
		  url: siteUrl+"backdoor/ajax-update_options.php",
		  type: "POST",
		  data: { name: this_name, content: this_content },
		}).done(function(data) {
			$this_input.addClass('success');
		});	
	});
	
	if ($('.file').length){
		$('#upload_photo').on('click', function(){
			$('.file').trigger('click');
			$(this).empty().html('<img src="img/ajax-loader.gif" alt=""/>')
		});
		
	    $('.file').AjaxFileUpload({
			onComplete: function(filename, response) {
				$('.photos ul').prepend('<li><img src="uploads/'+response.name+'" alt="" /></li>');
				$('#upload_photo').empty().html('Upload Photo');
			}
	    });
	}
	
	$('.delete').bind('click', function(){
		var $this_item = $(this);
		var this_id = $(this).attr('data-id');
		var this_url = $(this).attr('data-url');
		
		$.ajax({
		  url: siteUrl+"backdoor/ajax-delete_image.php",
		  type: "POST",
		  data: { id: this_id, image_url: this_url },
		}).done(function(data) {
			$this_item.parent('li').remove();
		});	
	});
});