import { Storage } from "../utils/storage.js";
export class Folder{
    // save = {
    //     projects: [
    //     { id: "p1", name: "Instagram" },
    //     { id: "p2", name: "Facebook" }
    // ],

    // sections: [
    //     { id: "s1", projectId: "p1", name: "Дизайн" },
    //     { id: "s2", projectId: "p1", name: "Разработка" },
    //     { id: "s3", projectId: "p2", name: "Аналитика" },
    //     { id: "s4", projectId: null, name: "Маркетинг" }
    // ]
    // }

    storageKey = 'folder';

    selectors = {
        projects: '.projects__list',
        btnAddProject: '.button--add-project',
        btnViewProjects: '.button--view-projects',

        projectsItem: 'projects__item',
        menuItem: 'menu__item',
        tabs: 'js-tabs',
        menuContent: 'menu__content',
        contentIcon: 'projects__icon',
        contentInput: 'projects__input',
        contentInput__editing: 'projects__input--editing',
        projectCounter: 'projects__counter',
        counter: 'counter',
        hidden: 'projects__list--hidden',

        icon: {
            project: '#icon_project',
        }
    }

    elements = {
        projects: document.querySelector(this.selectors.projects),
        btnAddProject: document.querySelector(this.selectors.btnAddProject),
        btnViewProjects: document.querySelector(this.selectors.btnViewProjects),
    }

    data = null;
    dataProjectsMap = null;

    constructor(){
        this.init();
    }

    init(){
        this.data = this.loadProjects() || {
            projects: [],
            sections: [],
        };
        this.dataProjectsMap = this.createProjectMap();
        // this.data = this.save;
        // this.dataProjectsMap = this.createProjectMap();
        // this.saveProjects(this.data);

        this.bindEvents();
    }

    createProjectMap(){
        const map = new Map();
        this.data.projects.forEach(project => {
            map.set(project.id, project);
        });
        return map;
    }

    bindEvents(){
        this.elements.btnAddProject?.addEventListener('click', (event) => this.addProject(event));
        this.elements.projects?.addEventListener('keydown', (e) => this.handleProjectKeydown(e));
        this.elements.projects?.addEventListener('blur', (e) => this.handleProjectBlur(e), true);
        this.elements.projects?.addEventListener('dblclick', (e) => this.handleProjectDoubleClick(e));
        this.elements.btnViewProjects?.addEventListener('click', () => this.toggleViewProjects());
    }

    handleProjectKeydown(e){
        if (e.key === 'Enter') {
            e.stopPropagation();
            this.renameProject(e.target);
        }
    }

    toggleViewProjects(){
        this.elements.projects.classList.toggle(this.selectors.hidden);
        this.elements.btnViewProjects.style.transform = this.elements.projects.classList.contains(this.selectors.hidden) ? 'rotate(180deg)' : 'rotate(0deg)';
    }

    showProjects(){
        const fragment = document.createDocumentFragment();
        this.data.projects.forEach(element => {
            console.log(element);
            fragment.append(this.createProjectItem(element));
        });
        this.elements.projects.innerHTML = '';
        this.elements.projects.append(fragment);
    }

    loadProjects(){
        const res = Storage.loadFromStorage(this.storageKey);
        console.log(res);
        return res;
    }

    saveProjects(value){
        Storage.saveInStorage(this.storageKey, value);
    }
    

    addProject(event){
        event.stopPropagation();
        console.log('clicked',event.target);

        const newProject = {
            id: this.generateId(),
            name: 'Без названия',
        };

        this.data.projects.push(newProject);
        this.dataProjectsMap.set(newProject.id, newProject);

        const projectItem = this.createProjectItem(newProject);
        this.elements.projects.append(projectItem);

        this.focusOnInput(projectItem);
    }

    focusOnInput(projectElement){
        setTimeout(() => {
            const input = projectElement.querySelector(`.${this.selectors.contentInput}`);
            if (input) {
                input.focus();
                input.select();
                input.classList.add(this.selectors.contentInput__editing);
                input.readOnly = false;
                
                console.log('Input focused:', input);
                console.log('Input value:', input.value);
                console.log('Is input focused?', document.activeElement === input);
            }
        }, 50); 
    }

    createProjectItem(item){
        console.log(item);
        const {id, name = 'Без названия'} = item;
        const projectContent = document.createElement('div');
        projectContent.className = `${this.selectors.projectsItem} ${this.selectors.menuItem}`;
        projectContent.setAttribute(this.selectors.tabs,'');
        projectContent.dataset.type = 'project';
        projectContent.dataset.name = name;
        projectContent.dataset.id = id;

        projectContent.innerHTML = `
            <div class="${this.selectors.menuContent}">
                <svg class="${this.selectors.contentIcon}"><use href="${this.selectors.icon.project}"></use></svg>
                <input class="${this.selectors.contentInput}" type="text" name="projectName" value="${name}" readonly>
            </div>
            <span class="${this.selectors.projectCounter} ${this.selectors.counter}"></span>
        `
        return projectContent;
    }

    generateId(){
        return 'p' + Date.now() + Math.random().toString(36).substr(2, 9);
    }

    handleProjectBlur(e){
        e.stopPropagation();
        if (e.target.classList.contains(this.selectors.contentInput)) {
            console.log('Project input blur:', e.target);
            this.renameProject(e.target);
        }
    }

    removeFocusOnInput(inputElement){
        inputElement.readOnly = true;
        inputElement.classList.remove(this.selectors.contentInput__editing);
        inputElement.blur();
    }

    renameProject(inputElement){
        try {
            const projectItem = inputElement.closest(`.${this.selectors.projectsItem}`);
            const projectId = projectItem.dataset.id;
            const newName = inputElement.value.trim() || 'Без названия';
            const project = this.dataProjectsMap.get(projectId);

            if (!project) {
                console.warn(`Not found project id: ${projectId} in element ${inputElement}`);
                return;
            }

            project.name = newName;
            projectItem.dataset.name = newName;
            inputElement.value = newName;
            
            this.saveProjects(this.data);
            this.removeFocusOnInput(inputElement);
            document.dispatchEvent(new CustomEvent('renameProject', {detail: { title: newName }}));

            console.log('Project saved successfully');
        } catch (error) {
            console.warn('Project error saved');
        }
    }

    handleProjectDoubleClick(e){
        e.stopPropagation();
        const projectItem = e.target.closest(`.${this.selectors.projectsItem}`);
        if (projectItem) {
            console.log('Project input DoubleClick:', e.target);
            this.focusOnInput(projectItem);
        }
    }
}