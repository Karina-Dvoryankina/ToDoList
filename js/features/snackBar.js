export class SnackBar {
    constructor() {
        this.iconMap = {
            info: '#icon_snackbar-info',
            success: '#icon_snackbar-check',
            error: '#icon_snackbar-error',
            warning: '#icon_snackbar-warning'
        };
        this.selectors = this.getSelectors();
        this.elements = this.getElements();
    }

    getSelectors(){
        return {
            snackbar: 'snackbar',
            snackbar__show: 'snackbar--show',
            snackbar__hide: 'snackbar--hide',
            snackbar__text: 'snackbar__text',
            snackbar__wrapper: 'snackbar__wrapper',
            snackbar__icon: 'snackbar__icon',
        }
    }

    getElements(){
        return{
            app: document.querySelector('.app'),
        }
    }

    show(message, type = 'info', duration = 2000) {
        const icon = this.iconMap[type] || this.iconMap['info'];

        const snackBar = this.createSnackBarElement(message, type, icon);
        this.elements.app?.appendChild(snackBar);

        setTimeout(() => {
            snackBar.classList.remove(this.selectors.snackbar__show);
            snackBar.classList.add(this.selectors.snackbar__hide);
            setTimeout(() => {
                this.elements.app?.removeChild(snackBar);
            }, 500);
        }, duration);
    }

    createSnackBarElement(message, type, icon) {
        const snackBar = document.createElement('div');
        snackBar.className = `${this.selectors.snackbar} ${this.selectors.snackbar__show}`;
        snackBar.dataset.type = type;

        const text = document.createElement('span');
        text.className = this.selectors.snackbar__text;
        text.textContent = message;
        
        const div_icon = document.createElement('div');
        div_icon.className = 'snackbar__wrapper';
        div_icon.innerHTML = `<svg class="${this.selectors.snackbar__icon}"><use href="${icon}"></use></svg>`;

        snackBar.append(div_icon, text);

        return snackBar;
    }
}