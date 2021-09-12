import { error, info, success } from '@pnotify/core';
import '@pnotify/core/dist/PNotify.css';
import '@pnotify/core/dist/BrightTheme.css';

const notification = function (typeNotify, textNotify) {
    if (typeNotify === 'error') {
        error({
            text: textNotify,
            delay: 3000,
        });
        return;
    }

    if (typeNotify === 'info') {
        info({
            text: textNotify,
            delay: 2000,
        });
        return;
    }

    if (typeNotify === 'success') {
        success({
            text: textNotify,
            delay: 2000,
        });
        return;
    }
};

export { notification };
