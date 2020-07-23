<template>
  <div :style="{ userSelect, flexDirection }" class="split-panel" @mouseup="onUp" @mousemove="onMouseMove" @touchmove="onMove" @touchend="onUp">
    <div :style="leftPaneStyle" class="left-pane splitter-pane">
      <slot name="left-pane"></slot>
    </div>
    <div class="splitter" :class="{active}" @mousedown="onDown" @click="onClick" @touchstart.prevent="onDown"></div>
    <div :style="rightPaneStyle" class="right-pane splitter-pane ml-2">
      <slot name="right-pane"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SplitPanel',
  props: {
    margin: {
      type: Number,
      default: 0
    },
    horizontal: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      active: false,
      percent: 22,
      hasMoved: false
    }
  },
  computed: {
    flexDirection () {
      return 'row'
    },
    leftPaneStyle () {
      let percentStr = this.percent + '%';
      let widthStr = 'calc(' + percentStr + ' - 2px' + ')';
      return { width: widthStr }
    },
    rightPaneStyle () {
      let percentStr = (100 - this.percent) + '%';
      let widthStr = 'calc(' + percentStr + ' - 2px' + ')';
      return { width: widthStr }
    },
    userSelect () {
      return this.active ? 'none' : ''
    }
  },
  methods: {
    onClick () {
      if (!this.hasMoved) {
        this.$emit('resize');
      }
    },
    onDown () {
      this.active = true;
      this.hasMoved = false;
    },
    onUp () {
      this.active = false;
    },
    onMove (e) {
      let offset = 0;
      let target = e.currentTarget;
      let percent = 0;
      if (this.active) {
        if (this.horizontal) {
          while (target) {
            offset += target.offsetTop;
            target = target.offsetParent;
          }
          percent = Math.floor(((e.pageY - offset) / e.currentTarget.offsetHeight) * 10000) / 100;
        } else {
          while (target) {
            offset += target.offsetLeft;
            target = target.offsetParent;
          }
          percent = Math.floor(((e.pageX - offset) / e.currentTarget.offsetWidth) * 10000) / 100;
        }
        if (percent > this.margin && percent < 100 - this.margin) {
          this.percent = percent;
        }
        this.$emit('resize');
        this.hasMoved = true;
      }
    },
    onMouseMove (e) {
      if (e.buttons === 0 || e.which === 0) {
        this.active = false;
      }
      this.onMove(e);
    }
  }
}
</script>

<style scoped>
.split-panel {
  height: inherit;
  display: flex;
}

.split-panel .splitter-pane {
  height: inherit;
  /* cannot do this since it will break sticky list menu */
  /* overflow-y: auto; */
}

.split-panel .left-pane {
  position:sticky;
  top: 62px;
  height: calc(100vh - 62px);
  padding-bottom: 2em;
  overflow-y: auto;
}

.split-panel .splitter {
  background-color: #eeeeee;
  width: 5px;
  cursor: ew-resize;
  height: calc(100vh - 62px);
  position: sticky;
  top: 60px;
  background-image:  url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==');
  background-repeat: no-repeat;
  background-position: 50%;
}
</style>
