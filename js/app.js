import { initAutosizeTextarea } from './utils/autosize.js';
import './features/deadline.js';
import { Board } from './features/board.js';
import { TaskManager } from './features/taskManager.js'
import { Modal } from './features/modal.js';
import { Folder } from './features/folder.js';
import { Dropdown } from './features/dropdown.js';


document.addEventListener('DOMContentLoaded', () => {
    initAutosizeTextarea();
});



class App {
    selectors = {
        menu: '.menu__list',
        menuText: '.menu__text',
        counter: '.counter',
        btnOpenModal: '.button--modal-task',
        btnAddProject: '.button--add-project',
        sidebarMenu: '.app__sidebar',
        
        tabs: '[js-tabs]',
        tabDefault: '[js-tabs-default]',
        tabTask: 'tasks',
        tabActive: 'menu__item--active',
        typeDefault: 'tasks',
    }

    elements = {
        menu: document.querySelector(this.selectors.menu),
        tabDefault: document.querySelector(this.selectors.tabDefault),
        btnAddProject: document.querySelector(this.selectors.btnAddProject),
        sidebarMenu: document.querySelector(this.selectors.sidebarMenu),
    }

    activeTab = {
        type: null,
        name: null,
        id: null
    }

    board = null;

    filtredCacheTask = new Map();

    constructor(){
        this.taskManager = new TaskManager();
        this.folder = new Folder();
        this.dropdown = new Dropdown(this.folder);
        this.modal = new Modal(this.dropdown, this.taskManager);

        this.unsubscribeTasks = this.taskManager.subscribe((tasks) => {
            console.log('taskManager -> tasks changed', tasks.length);
            this.updateTabCounter();   
            this.showContentBoard();
        });

        this.init();
    }

    init(){
        this.folder.showProjects();
        this.updateTabCounter();
        this.selectTabDefault();
        this.bindEvents();
    }

    bindEvents(){
        this.elements.sidebarMenu?.addEventListener('click', this.handlerMenuItem);
        document.addEventListener('click', this.handlerModalOpen);
    }

    handlerMenuItem = (event) => {
        const menuItem = event.target.closest(this.selectors.tabs);
        if (menuItem) {
            event.stopPropagation();
            console.log('Tab clicked:', menuItem);
            this.selectTab(menuItem);
        }
    }

    handlerModalOpen = (event) => {
        console.log('Clicked:', event.target);
        const button = event.target.closest(this.selectors.btnOpenModal);
        if (button) {
            console.log('app',this.activeTab)
            this.modal.openModal(this.activeTab);
        }
    }

    selectTabDefault(){
        const tab = this.elements.tabDefault || this.elements.tabs.length > 0;
        console.log(tab);
        if (tab) {
            this.selectTab(tab);
        }
    }

    selectTab = (tab) => {
        const tabs = document.querySelectorAll(this.selectors.tabs);
        tabs.forEach(item => {
            item.classList.remove(this.selectors.tabActive);
        });
        
        tab.classList.add(this.selectors.tabActive);

        const {type, name, id} = tab.dataset;
        console.log(type, name, id);
        this.setActiveTab(type, name, id)

        if (this.board) this.board.setActiveTab(this.activeTab);
        this.showContentBoard();
    }

    setActiveTab(type,name, id){
        this.activeTab = {
            type: type || this.selectors.typeDefault,
            name: name || 'Без названия',
            id: id || null
        }
        console.log(this.activeTab);
    }

    showContentBoard(){
        // const tasks = this.taskManager.filtersTask(tab.type);
        // const typeBoard = type === this.selectors.tabTask ? 'list' : 'board';
        const typeBoard = 'list';
        const {type, id} = this.activeTab;
        const tasks = this.getFilteredCacheTask(type, id);
        console.log('Filtered cache tasks for board:', tasks);
        if (this.board) {
            this.board.renderContentBoard('list', tasks, this.activeTab);
        } else {
            this.board = new Board(typeBoard, this.activeTab, this.modal, tasks, this.taskManager);
        }
    }
    

    updateTabCounter(){
        console.log('Updating tab counters...');
        const tabs = document.querySelectorAll(this.selectors.tabs);
        this.filtredCacheTask.clear();
        tabs.forEach(tab => {
            const counterElement = tab.querySelector(this.selectors.counter);
            if (counterElement) {
                const {type, name, id} = tab.dataset;
                const tasks = this.taskManager.filtersTask({ type, name, id });
                console.log('group',tasks,'\ntype', type, '\nid', id, '\nlength', tasks.length);

                this.saveFilteredCacheTask(type, id, tasks);

                counterElement.textContent = tasks.length > 0 ? tasks.length : '';
            }
        });
    }

    saveFilteredCacheTask(type, id, tasks){
        const cacheKey = this.getCacheKey(type, id);
        this.filtredCacheTask.set(cacheKey, tasks);
    }

    getCacheKey(type, id){
        return id ? `${type}_${id}` : type;
    }

    getFilteredCacheTask(type, id){
        const cacheKey = this.getCacheKey(type, id);
        return this.filtredCacheTask.get(cacheKey) || [];
    }

}
new App();
