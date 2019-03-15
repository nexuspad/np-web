import Search from '../common/Search';
import Trashed from '../common/Trashed'
import Album from './Album';
import Carousel from './Carousel';
import Photo from './Photo';
import NPModule from '../../core/datamodel/NPModule';
import FolderDetail from '../folder/FolderDetail';
import AppRoute from '../AppRoute';

export default class PhotoModule extends AppRoute {
  static routes (base) {
    AppRoute.base = base;

    if (base) {
      base = '/' + base;
    } else {
      base = '';
    }

    return [{
      path: base + '/photo',
      component: Photo,
      props: { moduleId: NPModule.PHOTO },
      children: [
        {
          name: 'photoHome',
          path: '',
          component: Album
        },
        {
          name: 'photoHomeCarousel',
          path: 'carousel',
          component: Carousel,
          props: true
        },
        {
          name: 'photoFolder',
          path: 'folder/:folderId',
          component: Album
        },
        {
          name: 'sharedPhotoFolder',
          path: 'shared/:user/:folderId',
          component: Album
        },
        {
          name: 'photoFolderCarousel',
          path: 'folder/:folderId/carousel',
          component: Carousel,
          props: true
        },
        {
          name: 'newPhotoFolder',
          path: 'folder/add',
          component: FolderDetail,
          props: true
        },
        {
          name: 'updatePhotoFolder',
          path: 'folder/:folderId/update',
          component: FolderDetail,
          props: true
        },
        {
          name: 'photoSearch',
          path: 'search',
          component: Search,
          props: true
        },
        {
          name: 'photoTrash',
          path: 'trash',
          component: Trashed,
          props: true
        }
      ]
    }];
  }
}
