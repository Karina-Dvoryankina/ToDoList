
// Модель данных для хранения проектов и разделов
// const dataStructureFolder = {
//   projects: [
//     { id: "p1", name: "Instagram" },
//     { id: "p2", name: "Facebook" }
//   ],
//   sections: [
//     { id: "s1", projectId: "p1", name: "Дизайн" },
//     { id: "s2", projectId: "p1", name: "Разработка" },
//     { id: "s3", projectId: "p2", name: "Аналитика" },
//     { id: "s4", projectId: null, name: "Маркетинг" }
//   ]
// };
// console.log(dataStructureFolder);

import { Storage } from "../utils/storage.js";

export class Dropdown {

    selectors = {
        dropdown: '.dropdown',
        modalSelect: '.modal__select',
        fieldSelectedItem: '.select__button',
        arrow: '.button__arrow',

        dropdownItem: 'dropdown__item',
        dropdownTitle: 'dropdown__title',
        dropdownItem__project: 'dropdown__item-projects',
        dropdownItem__section: 'dropdown__item-sections',
        dropdownItem__default: 'dropdown__item-default',
        dropdownIcon: 'dropdown__icon-selected',
        arrow__rotate: 'button__arrow--rotate',
        fieldSelectedItem__active: 'select__button--active',
        fieldSelectedItem__disabled: 'button--disabled',
        dropdownItem__active: 'dropdown__item--active',
        dropdownIcon__active: 'dropdown__icon-selected--active',
        hidden: 'visually-hidden',
        
        icons: {
            default: '#icon_task',
            project: '#icon_project',
            section: '#icon_add-section',
            selected: '#icon_dropdown-selected'
        }
    }

    elements = {
        dropdown: document.querySelector(this.selectors.dropdown),
        modalSelect: document.querySelector(this.selectors.modalSelect),
        fieldSelectedItem: document.querySelector(this.selectors.fieldSelectedItem),
        arrow: document.querySelector(this.selectors.arrow),
        dropdownItem__default: document.querySelector(`.${this.selectors.dropdownItem__default}`)
    }

    iconMap = {
        default: this.selectors.icons.default,
        project: this.selectors.icons.project,
        section: this.selectors.icons.section,
        title: null
    };

    constructor(folder){
        this.folder = folder;
        this.dataStructureFolder = folder.data;
        console.log(this.dataStructureFolder);
        this.selectedItem = null;
        this.init();
    }

    init(){
        this.renderDropdownItems();
        this.bindEvents();
    }

    setDefaultSelection = (activeTab = {type: 'default', id: null}) => {
        if (!activeTab) return;

        const { type, id } = activeTab;
        let item = null;

        if (type === 'project' && id) {
            item = document.querySelector(`.${this.selectors.dropdownItem}[data-type="project"][data-id-project="${id}"]`);
        }

        if (!item) {
            item = document.querySelector(`.${this.selectors.dropdownItem__default}`);
        }

        if (item) {
            this.selectItem(item);
        }
    }

    bindEvents(){
        this.elements.modalSelect?.addEventListener('click', this.toggleDropdown);
        this.elements.dropdown?.addEventListener('click', this.handlerDropdownClick);
        document.addEventListener('click', this.handlerOutsideClick);
        document.addEventListener('renameProject', () => this.updateDataStructure()); 
    }

    updateDataStructure(){
        console.log('Dropdown: Обновление структуры данных', this.folder.storageKey);
        this.dataStructureFolder = Storage.loadFromStorage(this.folder.storageKey);
        console.log(this.dataStructureFolder);
        this.renderDropdownItems();
    }

    hasProjects(){
        return this.dataStructureFolder.projects.length > 0;
    }

    renderDropdownItems(){
        if (!this.elements.dropdown) return;

        const fragment = document.createDocumentFragment();

        fragment.append(this.createDropdownItem({ text: 'Задачи', isActive: true }));
        fragment.append(this.createDropdownItem({ type: 'title', text: 'Мои проекты' }));

        if (!this.hasProjects()) {
            this.elements.fieldSelectedItem?.classList.add(this.selectors.fieldSelectedItem__disabled);
            console.log('Dropdown: Нет проектов для отображения');
        }

        this.dataStructureFolder.projects.forEach(project => {
            fragment.append(this.createDropdownItem({ type: 'project', text: project.name, idProject: project.id }));

            const sections = this.dataStructureFolder.sections.filter(section => section.projectId === project.id);

            sections.forEach(section => {
                fragment.append(this.createDropdownItem({ type: 'section', text: section.name, idProject: project.id, idSection: section.id }));
            });
        });

        this.elements.dropdown.innerHTML = '';
        this.elements.dropdown.append(fragment);
    }

    createDropdownItem(options = {}){
        const { type = 'default', text = 'Item', idProject = null, idSection = null, isActive = false } = options;
        const li = document.createElement('li'); 
        li.dataset.type = type;

        type === 'title' ? li.className = this.selectors.dropdownTitle : li.className = `${this.selectors.dropdownItem}`;

        if(type === 'project'){
            li.classList.add(this.selectors.dropdownItem__project);
            li.dataset.idProject = idProject;
        }
        if(type === 'section'){
            li.classList.add(this.selectors.dropdownItem__section);
            li.dataset.idSection = idSection;
            li.dataset.idProject = idProject;
        }
        if(type === 'default'){
            li.classList.add(this.selectors.dropdownItem__default);
        }
        if(isActive){
            li.classList.add(this.selectors.dropdownItem__active);
        }

        const icon = this.iconMap[type] || null;

        li.innerHTML = `
            <div class="dropdown__content content">
                ${icon ? `<svg class="content__icon"><use href= ${icon}></use></svg>` : ''}
                <span class="content__text">${text}</span>
            </div>

            ${type !== 'title' ? `<svg class="dropdown__icon dropdown__icon-selected ${isActive ? 'dropdown__icon-selected--active' : ''}"><use href="#icon_dropdown-selected"></use></svg>` : ''}
        `;

        return li;
    }


    toggleDropdown = () => {
        if (!this.hasProjects()) return;
        this.elements.dropdown?.classList.toggle(this.selectors.hidden);
        this.elements.fieldSelectedItem?.classList.toggle(this.selectors.fieldSelectedItem__active);
        this.elements.arrow?.classList.toggle(this.selectors.arrow__rotate);
    }

    handlerDropdownClick = (event) => {
        const item = event.target.closest(`.${this.selectors.dropdownItem}`);
        console.log(item);
        if (item) {
            this.selectItem(item);
        }
    }

    selectItem = (item) => {
        const prevItemActive = document.querySelectorAll(`.${this.selectors.dropdownItem__active}`);
        prevItemActive.forEach(el => {
            el.classList.remove(this.selectors.dropdownItem__active);

            const selectedIcon = el.querySelector(`.${this.selectors.dropdownIcon}`);
            selectedIcon?.classList.remove(this.selectors.dropdownIcon__active);
        })

        item?.classList.add(this.selectors.dropdownItem__active);

        const selectedIcon = item.querySelector(`.${this.selectors.dropdownIcon}`);
        selectedIcon.classList.add(this.selectors.dropdownIcon__active);

        this.saveSelectedItem(item);
        this.updateSelectedItem(item);
    }

    updateSelectedItem(item) {
        const buttonContent = this.elements.fieldSelectedItem.querySelector('.button__content');
        if (!buttonContent) return;

        const path = this.buildPath(item);

        buttonContent.replaceChildren();

        path.forEach((node, index) => {
            buttonContent.append(node.cloneNode(true));
            if (index < path.length - 1) {
                const separator = document.createElement('span');
                separator.textContent = ' / ';
                buttonContent.append(separator);
            }
        });
    }

    buildPath(item){
        const path = [];

        if (!item) return path;

        const dropdownContent = item?.querySelector('.dropdown__content');
        if (dropdownContent) {
            path.unshift(dropdownContent.cloneNode(true));
        }

        if (item?.dataset.type === 'section') {
            const idProject = item.dataset.idProject;
            const project = document.querySelector(`[data-id-project="${idProject}"]`);

            if (project) {
                return [...this.buildPath(project), ...path];
            }
        }

        return path;
    }

    saveSelectedItem = (item) => {
        this.selected = {
            type: item.dataset.type,
            idProject: item.dataset.idProject || null,
            idSection: item.dataset.idSection || null
        };
    }

    getSelectedItem = () => {
        return this.selected;
    }

    handlerOutsideClick = (event) => {
        console.log(event.target);
        if (!this.elements.modalSelect?.contains(event.target) && 
            !this.elements.dropdown?.contains(event.target)) {
            this.closeDropdown();
        }
    }

    closeDropdown = () => {
        this.elements.dropdown?.classList.add(this.selectors.hidden);
        this.elements.fieldSelectedItem?.classList.remove(this.selectors.fieldSelectedItem__active);
        this.elements.arrow?.classList.remove(this.selectors.arrow__rotate);
    }
}