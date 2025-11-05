import { TaskManager } from './taskManager.js';
import { formatDayMonth } from '../utils/dates.js';
import { Modal } from './modal.js';
import { SnackBar } from './snackBar.js';
export class Board {

    selectors = {
        root: '.app__content',
        boardTitle: '.app__title',
        board: '.board',

        boardColumn: 'board__column',
        boardPriority: 'board__priority',
        boardCkeckbox: 'board__ckeckbox',
        boardRow: 'board__row',
        boardRow__empty: 'board__row--empty',
        card: 'board__card',
        cardTitle: 'card__title',
        cardSubTitle: 'card__subtitle',
        cardDedline: 'card__dedline',
        inputCompleted: 'ckeckbox-completed',
        boardIcon: 'board__icon',
        boardIcon__active: 'board__icon--active',
        btnOpenModal: '.button--modal-task',
        boardActions: 'board__actions',
        boardDeleteBtn: 'board__delete-btn',
        boardDeleteIcon: 'board__delete-icon',


        icon: {
            deadline: '#icon_deadline',
            addTask: '#icon_add-task',
            priority__outline: '#icon_priopity--outline',
            priority__filled: '#icon_priopity--active',
            delete: '#icon_delete',
        }
    }

    elements = {
        root: document.querySelector(this.selectors.root),
        board: document.querySelector(this.selectors.board),
        boardTitle: document.querySelector(this.selectors.boardTitle),
    }

    constructor(typeBoard = 'list', activeTab, modal = null, tasks = null, taskManager = null){
        this.taskManager = taskManager || new TaskManager();
        this.snackBar = new SnackBar();
        this.modal = modal || new Modal();
        this.activeTab = activeTab;
        this.showTasks(typeBoard, tasks);
        this.init();
    }

    setActiveTab(tab){
        this.activeTab = tab;
    }

    init(){
        this.bindEvents();
    }

    showTasks(typeBoard, tasks) {
        const tasksFiltered = tasks;
        if (!tasks){
            tasksFiltered = this.taskManager.filtersTask(this.activeTab);
            console.log('group board', tasksFiltered);
        }

        this.renderContentBoard(typeBoard, tasksFiltered);
    }

    renderContentBoard(typeBoard, tasks){
        this.viewTitle(this.activeTab.name);

        const view = {
            list: () => this.ListView(tasks),
            board: () => this.BoardView(tasks)
        }
        view[typeBoard]();
    }

    viewTitle(title){
        this.elements.boardTitle.textContent = title;
    }

    addPlugList(fragment){
        const p = document.createElement('p');
        p.className = this.selectors.boardRow__empty;
        p.textContent = 'Список задач пуст';

        const button = this.createDefaultButton();

        fragment.append(p, button);
    }

    BoardView(tasks){
        // const column = document.createElement('div');
        // column.className = this.selectors.boardColumn;

        // const card = document.createElement('div');
        // card.className = this.selectors.card;

        // const cardHeader = document.createElement('div');
        // cardHeader.className = this.selectors.cardHeader;

        // const cardTitle = document.createElement('div');
        // cardTitle.className = this.selectors.cardTitle;

        // const cardTitleText = document.createElement('span');
        // cardTitleText.textContent = 'Название колонки';


        // const btnAddTask = document.createElement('button');
        // btnAddTask.type = 'button';

    }

    ListView(groups) {
        const fragment = document.createDocumentFragment();

        if (!groups || groups.length <= 0) {
            this.showEmptyState();
            return;
        }

        const grouped = groups.groupedByDate || {};

        if (grouped['Все задачи']?.length) {
            const section = this.createGroupSection('Все задачи', grouped['Все задачи'], false);
            fragment.append(section);
        }

        // ===== 1. Просроченные =====
        const overdue = groups.overdue?.['Просрочено'] || [];
        if (overdue.length > 0) {
            const section = this.createGroupSection('Просроченные', overdue);
            fragment.append(section);
        }

        // ===== 2. Остальные группы по дате =====
        const dateKeys = Object.keys(grouped)
            .filter(key => key !== 'Бессрочно' && key !== 'Все задачи');

        for (const dateKey of dateKeys) {
            const section = this.createGroupSection(formatDayMonth(dateKey), grouped[dateKey]);
            fragment.append(section);
        }

        // ===== 3. Бессрочные =====
        if (grouped['Бессрочно']?.length) {
            const section = this.createGroupSection('Бессрочные', grouped['Бессрочно']);
            fragment.append(section);
        }

        // ===== 5. Добавить кнопку =====
        if (this.activeTab?.type !== 'completed') {
            const buttonAddTask = this.createDefaultButton();
            fragment.append(buttonAddTask);
        }

        this.elements.board.innerHTML = '';
        this.elements.board.append(fragment);
    }


    createGroupSection(title, tasks, isGroup = true) {
        const section = document.createElement('div');
        section.className = 'board__section';

        if (isGroup) {
            const header = document.createElement('h3');
            header.className = 'board__section-title';
            header.textContent = title;
            section.appendChild(header);
        }

        const list = document.createElement('div');
        list.className = 'board__section-list';

        tasks.forEach(task => {
            const row = this.createTaskElement(task);
            list.appendChild(row);
        });

        section.appendChild(list);
        return section;
    }

    
    createTaskElement(task) {
        const li = document.createElement('div');
        li.className = this.selectors.boardRow;
        li.dataset.id = task.id;
        li.innerHTML = this.createListItem(task);
        return li;
    }

    createListItem(task){
        return `
            <div class="${this.selectors.boardCkeckbox}">
                <input class="ckeckbox ${this.selectors.inputCompleted}" type="checkbox" name="task-complete" value="${task.isCompleted}" ${task.isCompleted ? 'checked' : ''}>
                <div class="${this.selectors.card}">
                    <p class="${this.selectors.cardTitle}">${task.name}</p>
                    <p class="${this.selectors.cardSubTitle}">${task.description}</p>
                    ${task.dueDate ? `
                        <div class="${this.selectors.cardDedline}">
                            <svg class="${this.selectors.cardDedline}-icon"><use href="${this.selectors.icon.deadline}"></use></svg>
                            <span class="${this.selectors.cardDedline}-text">${formatDayMonth(task.dueDate)}</span>
                        </div> ` : 
                    ''}
                </div>
            </div>

            <div class="${this.selectors.boardActions}">
                <button class="${this.selectors.boardDeleteBtn}" title="Удалить задачу">
                    <svg class="${this.selectors.boardDeleteIcon} ${this.selectors.boardIcon}">
                        <use href="${this.selectors.icon.delete}"></use>
                    </svg>
                </button>

                ${task.isPriority ? 
                    `<div class="${this.selectors.boardPriority}">
                        <svg class="${this.selectors.boardIcon}"><use href="${this.selectors.icon.priority__filled}"></use></svg>
                    </div>` : ''}
            </div>`
    }

    bindEvents(){
        this.elements.board.addEventListener('click', (event) => this.handlerBoardClick(event));
        document.addEventListener('renameProject', (event) => this.viewTitle(event.detail.title)); 
    }

    handlerBoardClick(event){
        event.stopPropagation();
        const {target} = event;

        const buttonModal = target.closest(this.selectors.btnOpenModal);
        if(buttonModal){
            this.clickOnButtonOpenModal();
            return;
        } 

        const buttonDelete = target.closest(`.${this.selectors.boardDeleteBtn}`);
        const row = target.closest(`.${this.selectors.boardRow}`);
        if (buttonDelete) {
            const taskId = row.dataset.id;
            this.taskManager.deleteTask(taskId);
            return;
        }

        if (row) {
            this.clickOnBoardRow(row);
        }
    }

    async clickOnBoardRow(row){
        const taskId = row.dataset.id;
        const input = row.querySelector(`.${this.selectors.inputCompleted}`);

        if(!taskId || !input){
            console.error('No taskId or input found');
            return;
        }

        if(this.taskManager.updateCompleted(taskId)){
            input.checked = !input.checked;
            await new Promise(resolve => setTimeout(resolve, 400));
            await this.animateTaskRemoval(row);
        }
    }

    clickOnButtonOpenModal(){
        console.log('board',this.activeTab);
        this.modal.openModal(this.activeTab);
    }

    animateTaskRemoval(row) {
    return new Promise(resolve => {
        row.classList.add('board__row--removing')
        row.addEventListener('transitionend', () => {
            row.remove();
            resolve();
        }, 300);
    });
}

    showEmptyState() {
        const fragment = document.createDocumentFragment();
        this.addPlugList(fragment);
        this.elements.board.innerHTML = '';
        this.elements.board.appendChild(fragment);
    }

    createDefaultButton(){
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'button board__button button--modal-task';
        button.innerHTML = `
            <svg class="button__icon"><use href="${this.selectors.icon.addTask}"></use></svg>
            <span class="button__text">Добавить задачу</span>`;
        return button;
    }


}