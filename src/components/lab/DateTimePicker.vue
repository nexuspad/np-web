<template>
  <div class="form-group">
    <input class="form-control" type="text" @input="onInput" data-input :placeholder="this.placeholder">
  </div>
</template>

<script type="text/javascript">
  import Flatpickr from 'flatpickr';
  // You have to import css yourself

  // All available hooks, copied from flatpickr source
  const hooks = [
    'onChange',
    'onClose',
    'onDestroy',
    'onKeyDown',
    'onMonthChange',
    'onOpen',
    'onYearChange'

    // Let's not include these events
    // 'onValueUpdate',
    // 'onDayCreate',
    // 'onParseConfig',
    // 'onReady',
    // 'onPreCalendarPosition',
  ];

  const camelToKebab = (string) => {
    return string.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  };

  const arrayify = (obj) => {
    return obj instanceof Array ? obj : [obj];
  };

  export default {
    name: 'DateTimePicker',
    props: {
      isFor: {
        type: String,
        default: 'all'
      },
      value: {
        default: null,
        required: true,
        validator (value) {
          return value === null || value instanceof Date || typeof value === 'string' || value instanceof String || value instanceof Array || typeof value === 'number'
        }
      },
      events: {
        type: Array,
        default: () => hooks
      },
      placeholder: {
        default: ''
      }
    },
    data () {
      return {
        pickerInstance: null
      };
    },
    mounted () {
      // Return early if flatPickr is already loaded
      /* istanbul ignore if */
      if (this.pickerInstance) return;

      // Init flatpickr
      // https://chmln.github.io/flatpickr/options/
      let config = {
        wrap: true,         // wrap since div is around the input
        defaultDate: null
      };

      if (this.isFor === 'time') {
        config.enableTime = true;
        config.noCalendar = true;
        config.dateFormat = 'H:i';
      }

      // Inject our method into events array
      let componentSelf = this;
      this.events.forEach((hook) => {
        config[hook] = arrayify(config[hook] || []).concat((...args) => {
          componentSelf.$emit(camelToKebab(hook), ...args)
        });
      });

      // Set initial date without emitting any event
      config.defaultDate = this.value || config.defaultDate;
      this.pickerInstance = new Flatpickr(this.getElem(config.wrap), config);
    },
    methods: {
      /**
       * Get the HTML node where flatpickr to be attached
       * Bind on parent element if wrap is true
       */
      getElem (wrap) {
        return wrap ? this.$el.parentNode : this.$el
      },

      /**
       * Watch for value changed by date-picker itself and notify parent component
       *
       * @param event
       */
      onInput (event) {
        this.$emit('dateTimeSelected', event.target.value);
      }
    },
    watch: {
      /**
       * Watch for any config changes and redraw date-picker
       *
       * @param newConfig Object
       */
      config: {
        deep: true,
        handler (newConfig) {
          // Workaround: Don't pass hooks to configs again otherwise
          // previously registered hooks will stop working
          hooks.forEach((hook) => {
            delete newConfig[hook];
          });
          this.pickerInstance.set(newConfig);
        }
      },
      /**
       * Watch for changes from parent component and update DOM
       *
       * @param newValue
       */
      value (newValue) {
        // Prevent updates if v-model value is same as input's current value
        if (newValue === this.$el.value) return;
        // Make sure we have a flatpickr instance
        this.pickerInstance &&
        // Notify flatpickr instance that there is a change in value
        this.pickerInstance.setDate(newValue, true);
      }
    },
    /**
     * Free up memory
     */
    beforeDestroy () {
      /* istanbul ignore else */
      if (this.pickerInstance) {
        this.pickerInstance.destroy();
        this.pickerInstance = null;
      }
    }
  };
</script>