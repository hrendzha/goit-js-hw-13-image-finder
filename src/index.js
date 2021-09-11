import 'material-icons';
import './sass/main.scss';
import refs from './js/refs';
import ImagesApiService from './services/imagesApiService';
import LoadMoreBtn from './js/components/load-more-btn';
import galleryItemsMrk from './templates/gallery-item.hbs';
import { notification } from './js/pnotify';

const imageApiService = new ImagesApiService();
const loadMoreBtn = new LoadMoreBtn({
    selector: '.js-load-more-btn',
    hidden: true,
});

let numberItemToScroll = imageApiService.perPage;

refs.searchForm.addEventListener('submit', onSearchFormSubmit);
loadMoreBtn.refs.btn.addEventListener('click', onLoadMoreBtnClick);

function onSearchFormSubmit(e) {
    e.preventDefault();

    const searchQuery = e.currentTarget.elements.query.value.trim();

    if (searchQuery === '') {
        notification('error', 'Enter something for query');
        return;
    }

    imageApiService.resetPage();
    imageApiService.query = searchQuery;
    loadMoreBtn.hide();
    clearGalleryMrk();

    imageApiService.fetchImages().then(({ hits }) => {
        if (hits.length === 0) {
            notification(
                'error',
                'Sorry, there are no images matching your search query. Please try again.',
            );
            return;
        }

        console.log(imageApiService.totalPages);
        appendPhotoCardsMarkup(hits);
        loadMoreBtn.show();
    });
}

function appendPhotoCardsMarkup(data) {
    refs.gallery.insertAdjacentHTML('beforeend', galleryItemsMrk(data));
}

function clearGalleryMrk() {
    refs.gallery.innerHTML = '';
}

function onLoadMoreBtnClick() {
    loadMoreBtn.disable();
    console.log(
        imageApiService.fetchImages().then(() => {
            loadMoreBtn.enable();
        }),
    );
    // imageApiService.fetchImages().then(({ hits }) => {
    //     console.log(imageApiService.totalPages);

    //     appendPhotoCardsMarkup(hits);
    //     loadMoreBtn.enable();
    //     scrollToNewImages();
    // });
}

function scrollToNewImages() {
    const galleryItems = refs.gallery.querySelectorAll('.gallery__item');

    galleryItems[numberItemToScroll].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
    });

    numberItemToScroll += imageApiService.perPage;
}
