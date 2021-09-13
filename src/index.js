import 'material-icons';
import 'simplelightbox/dist/simple-lightbox.min.css';
import './sass/main.scss';
import refs from './js/refs';
import ImagesApiService from './services/imagesApiService';
import LoadMoreBtn from './js/components/load-more-btn';
import galleryItemsMrk from './templates/gallery-item.hbs';
import { notification } from './js/pnotify';
import SimpleLightbox from 'simplelightbox';

const imageApiService = new ImagesApiService();
const loadMoreBtn = new LoadMoreBtn({
    selector: '.js-load-more-btn',
    hidden: true,
});
const lightbox = new SimpleLightbox('.js-gallery a');

let numberItemToScroll = 0;

refs.searchForm.addEventListener('submit', onSearchFormSubmit);
loadMoreBtn.refs.btn.addEventListener('click', onLoadMoreBtnClick);

async function onSearchFormSubmit(e) {
    e.preventDefault();

    const searchQuery = e.currentTarget.elements.query.value.trim();
    if (searchQuery === '') {
        notification('error', 'Enter something for query');
        return;
    }

    imageApiService.query = searchQuery;
    imageApiService.resetPage();
    loadMoreBtn.hide();
    clearGalleryMrk();
    numberItemToScroll = imageApiService.perPage;

    const { hits, totalHits } = await imageApiService.fetchImages();

    if (imageApiService.isLastPage) {
        notification(
            'error',
            'Sorry, there are no images matching your search query. Please try again.',
        );
        return;
    }

    appendPhotoCardsMarkup(hits);
    lightbox.refresh();
    loadMoreBtn.show();
    notification('success', `Hooray! We found ${totalHits} images.`);
}

function appendPhotoCardsMarkup(data) {
    refs.gallery.insertAdjacentHTML('beforeend', galleryItemsMrk(data));
}

function clearGalleryMrk() {
    refs.gallery.innerHTML = '';
}

function onLoadMoreBtnClick() {
    loadMoreBtn.disable();

    imageApiService.fetchImages().then(({ hits }) => {
        if (imageApiService.isLastPage) {
            notification('info', `We're sorry, there are no more posts to load`);
            loadMoreBtn.hide();
            loadMoreBtn.enable();
            return;
        }

        appendPhotoCardsMarkup(hits);
        lightbox.refresh();
        loadMoreBtn.enable();
        scrollToNewImages();
    });
}

function scrollToNewImages() {
    const galleryItems = refs.gallery.querySelectorAll('.gallery__item');

    galleryItems[numberItemToScroll].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
    });

    numberItemToScroll += imageApiService.perPage;
}
