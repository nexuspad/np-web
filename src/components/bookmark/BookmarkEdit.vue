<template>
  <div>
    <form>
      <div class="form-group row">
        <div class="col">
          <input type="text" class="form-control input-underline" :placeholder="npContent('title_optional')" v-model="bookmark.title">
        </div>
      </div>
      <div class="form-group row">
        <div class="col">
          <input type="text" class="form-control" :placeholder="npContent('web address')" v-model="bookmark.webAddress">
        </div>
      </div>
      <div class="form-group row">
        <div class="col">
          <label-input ref="tagInput" :initialValues="bookmark.tags" />
        </div>
      </div>
      <div class="form-group row">
        <div class="col">
          <textarea-autosize class="form-control input-underline" :placeholder="npContent('notes')" v-model="bookmark.note"></textarea-autosize>
        </div>
      </div>
    </form>
    <b-navbar toggleable="md" fixed="top" type="dark" variant="dark">
      <b-collapse is-nav id="editor_nav_menu_collapse">
        <b-navbar-nav>
          <b-nav-text class="mr-2"><message :location="'TOP_NAVBAR'" /></b-nav-text>
          <b-nav-text v-if="!bookmark.entryId">{{npContent('new bookmark')}}</b-nav-text>
          <b-nav-text v-if="bookmark.entryId">{{npContent('edit bookmark')}}</b-nav-text>
        </b-navbar-nav>
        <!-- right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <b-button-group class="mx-1">
            <button class="btn btn-primary" v-on:click="collectTags(); save($event, bookmark)">{{npContent('save')}}</button>
          </b-button-group>
          <b-button-group class="mx-1">
            <b-button class="my-2 my-sm-0" type="button" v-on:click="cancel()">{{npContent('cancel')}}</b-button>
          </b-button-group>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script>
import LabelInput from '../common/LabelInput';
import AccountService from '../../core/service/AccountService';
import NPEntry from '../../core/datamodel/NPEntry';
import EntryService from '../../core/service/EntryService';
import NPModule from '../../core/datamodel/NPModule';
import NPBookmark from '../../core/datamodel/NPBookmark';
import Message from '../common/Message';
import EntryActionProvider from '../common/EntryActionProvider';
import SiteProvider from '../common/SiteProvider';

export default {
  name: 'BookmarkEdit',
  props: ['folder'],
  mixins: [ EntryActionProvider, SiteProvider ],
  components: {
    LabelInput, Message
  },
  data () {
    return { bookmark: {} };
  },
  mounted () {
    this.bookmark = NPBookmark.blankInstance(this.folder);

    if (this.$route.params.entryId) {
      this.bookmark.entryId = this.$route.params.entryId;
      let componentSelf = this;
      AccountService.hello()
        .then(function (response) {
          EntryService.get(componentSelf.bookmark)
            .then(function (entry) {
              componentSelf.bookmark = entry;
              // repoint the folder reference to the one in the component so changing folder would work
              componentSelf.bookmark.folder = componentSelf.folder;
            })
            .catch(function (error) {
              console.log(error);
            });
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  },
  methods: {
    collectTags () {
      this.bookmark.tags = this.$refs.tagInput.getLabels();
    },
    cancel: function () {
      this.$router.back();
    }
  }
};
</script>
