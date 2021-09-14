import 'material-icons';
import 'simplelightbox/dist/simple-lightbox.min.css';
import './sass/main.scss';
import refs from './js/refs';
import ImagesApiService from './services/imagesApiService';
import LoadMoreBtn from './js/components/loadMoreBtn';
import galleryItemsMrk from './templates/gallery-item.hbs';
import { notification } from './js/pnotify';
import SimpleLightbox from 'simplelightbox';
import clearMrkInside from './js/clearMrkInside';
import ScrollToNewImages from './js/scrollToNewImages';
import ScrollToTopBtn from './js/components/scrollToTopBtn';
import throttle from 'lodash.throttle';

const imageApiService = new ImagesApiService();
const loadMoreBtn = new LoadMoreBtn({
    selector: '.js-load-more-btn',
    hidden: true,
});
const scrollToTopBtn = new ScrollToTopBtn('.scrollToTopBtn');
const lightbox = new SimpleLightbox('.js-gallery a');
const scrollToNewImages = new ScrollToNewImages({
    selector: '.js-gallery .gallery__item',
    imagesPerPage: imageApiService.perPage,
});

refs.searchForm.addEventListener('submit', onSearchFormSubmit);
loadMoreBtn.refs.btn.addEventListener('click', onLoadMoreBtnClick);
document.addEventListener('scroll', throttle(scrollToTopBtn.onScroll.bind(scrollToTopBtn), 250));
refs.scrollToTopBtn.addEventListener('click', scrollToTopBtn.onScrollToTopBtnClick);

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
    clearMrkInside(refs.gallery);
    scrollToNewImages.resetNumberItemToScroll();

    try {
        const { hits, totalHits } = await imageApiService.fetchImages();

        if (imageApiService.isLastPage) {
            notification(
                'error',
                'Sorry, there are no images matching your search query. Please try again.',
            );
            return;
        }

        updateUIAndRefreshLightbox(hits);
        loadMoreBtn.show();
        notification('success', `Hooray! We found ${totalHits} images.`);
    } catch (error) {
        errorNotify(error.message);
    }
}

async function onLoadMoreBtnClick() {
    loadMoreBtn.disable();

    try {
        const { hits } = await imageApiService.fetchImages();

        if (imageApiService.isLastPage) {
            notification('info', `We're sorry, there are no more posts to load`);
            loadMoreBtn.hide();
            loadMoreBtn.enable();
            return;
        }

        updateUIAndRefreshLightbox(hits);
        loadMoreBtn.enable();
        scrollToNewImages.scroll();
    } catch (error) {
        errorNotify(error.message);
    }
}

function appendPhotoCardsMarkup(data) {
    refs.gallery.insertAdjacentHTML('beforeend', galleryItemsMrk(data));
}

function updateUIAndRefreshLightbox(data) {
    appendPhotoCardsMarkup(data);
    lightbox.refresh();
}

function errorNotify(message) {
    notification('error', `Something went wrong (${message}) please try again later`);
}
