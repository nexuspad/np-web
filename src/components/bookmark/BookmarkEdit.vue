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
    <nav class="navbar fixed-top navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid">
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item text-light px-1"><message :location="'TOP_NAVBAR'" /></li>
            <li class="nav-item text-light px-1" v-if="!bookmark.entryId">{{npContent('new bookmark')}}</li>
            <li class="nav-item text-light px-1" v-if="bookmark.entryId">{{npContent('edit bookmark')}}</li>
          </ul>
          <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
            <li class="nav-item px-1">
              <button class="btn btn-primary" v-on:click="collectTags(); save($event, bookmark)">{{npContent('save')}}</button>
            </li>
            <li class="nav-item px-1">
              <button class="btn btn-warning" v-on:click="cancel()">{{npContent('cancel')}}</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>
import LabelInput from '../common/LabelInput';
import AccountService from '../../core/service/AccountService';
import EntryService from '../../core/service/EntryService';
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
        .then(function () {
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
