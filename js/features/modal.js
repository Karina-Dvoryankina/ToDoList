
import { TaskManager } from './taskManager.js';
import { Dropdown } from './dropdown.js';
import { fp } from './deadline.js';
import { Folder } from "./folder.js";

export class Modal {
	constructor(dropdown = null, taskManager = null){
		this.dropdown = dropdown || new Dropdown(new Folder());
		this.selectors = this.getSelectors();
		this.elements = this.getElements();
		this.taskManager = taskManager || new TaskManager();
		this.init();
	}

	getSelectors(){
		return {
			modal__id: 'task-modal',
			btnCloseModal__id: 'cancel-modal-task',
			checkboxPriority__id: 'input-priority',
			btnAddTask: '.button--add-task',
			fieldNameTask__id: 'field-name',
			modalForm__id: 'modal__form',
			fieldDescTask__id: 'field-description',
		}
	}

	getElements(){
		return {
			modal: document.getElementById(this.selectors.modal__id),
			btnCloseModal: document.getElementById(this.selectors.btnCloseModal__id),
			checkboxPriority: document.getElementById(this.selectors.checkboxPriority__id),
			btnAddTask: document.querySelector(this.selectors.btnAddTask),
			fieldNameTask: document.getElementById(this.selectors.fieldNameTask__id),
			fieldDescTask: document.getElementById(this.selectors.fieldDescTask__id),
			modalForm: document.getElementById(this.selectors.modalForm__id),
		}
	}

	init(){
		this.bindEvents();
	}

	bindEvents(){
		this.elements.btnCloseModal?.addEventListener('click', this.closeModal);
		this.elements.checkboxPriority?.addEventListener('change', this.handlerChangeChecbox);
		this.elements.fieldNameTask?.addEventListener('input', this.toggleBtnSubmit);
		this.elements.modalForm?.addEventListener('submit', this.submitFormTask);
	}

	openModal(activeTab = null){
		const modal = this.elements.modal;
		if (!modal) return;

		modal.showModal();

		if (activeTab) this.dropdown.setDefaultSelection(activeTab);
	}

	submitFormTask = (event) => {
		event.preventDefault();
		event.stopImmediatePropagation();

		const name = this.elements.fieldNameTask.value.trim();
		const description = this.elements.fieldDescTask.value.trim() || '';
		const dueDateRaw = document.querySelector('[name="input-date"]')?.value || '';
		const isPriority = this.elements.checkboxPriority.checked;
		const location = this.dropdown.getSelectedItem();

		let dueDate = null;
		if (dueDateRaw) {
			const date = new Date(dueDateRaw);
			if (!isNaN(date.getTime())) dueDate = date.toDateString();
		}

		const task = { name, description, dueDate, isPriority, location };
		const newTask = this.taskManager.addTask(task);
		console.log(newTask);

		this.closeModal();
	}

	closeModal = () => {
		this.elements.modal?.close();
		this.resetModal();
	}

	resetModal(){
		this.elements.modalForm?.reset();
		if (fp) fp.clear();
		this.toggleBtnSubmit();
	}

	handlerChangeChecbox = (event) => {
		const checkbox = event.target;
		checkbox.value = checkbox.checked.toString();
	}

	toggleBtnSubmit = () => {
		this.elements.btnAddTask.disabled = !this.elements.fieldNameTask?.value.trim();
	}
}
