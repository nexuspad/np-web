<template>
  <div>
    <div class="mt-1 mb-2 np-entry-menu-bar">
      <b-button-toolbar variant="light" size="sm">
        <b-button-group size="sm" class="mr-1">
          <b-button class="pl-3 pr-3" variant="gray" @click="$router.back()">
            <i class="fas fa-level-up-alt flipH" data-fa-transform="flip-h"></i>
          </b-button>
        </b-button-group>
        <entry-menu :entry="selectedPhoto" :folder="folder" />
      </b-button-toolbar>
    </div>
    <div class="np-content-below-menu">
      <b-carousel id="photoCarousel"
                  style="text-shadow: 1px 1px 2px #333;"
                  controls
                  indicators
                  :interval="0"
                  img-height="200px"
                  :value="imageIndex"
                  @sliding-start="onSlideStart"
                  @sliding-end="onSlideEnd">

        <!-- Text slides with image -->
        <b-carousel-slide :caption="image.title"
                          v-for="(image, imageIndex) in images" :key="imageIndex">
          <img slot="img" class="d-block img-fluid" :src="image.lightbox">
        </b-carousel-slide>
      </b-carousel>
    </div>
  </div>
</template>

<script>
import EntryMenu from '../common/EntryMenu';
import EntryActionProvider from '../common/EntryActionProvider';

export default {
  name: 'Carousel',
  props: ['images', 'imageIndex', 'folder'],
  mixins: [ EntryActionProvider ],
  components: {
    EntryMenu
  },
  data () {
    return {
      sliding: null,
      selectedPhoto: null
    }
  },
  beforeMount () {
    this.selectedPhoto = this.images[this.imageIndex];
  },
  mounted () {
  },
  methods: {
    onSlideStart () {
      this.sliding = true;
    },
    onSlideEnd (slide) {
      this.sliding = false;
      this.selectedPhoto = this.images[slide];
    }
  }
}
</script>

<style>
.carousel-inner > .carousel-item > img {
  margin: 0 auto;
}

.carousel-control-prev-icon {
  background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23cecece' viewBox='0 0 8 8'%3E%3Cpath d='M5.25 0l-4 4 4 4 1.5-1.5-2.5-2.5 2.5-2.5-1.5-1.5z'/%3E%3C/svg%3E");
}

.carousel-control-next-icon {
  background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23cecece' viewBox='0 0 8 8'%3E%3Cpath d='M2.75 0l-1.5 1.5 2.5 2.5-2.5 2.5 1.5 1.5 4-4-4-4z'/%3E%3C/svg%3E");
}
</style>
