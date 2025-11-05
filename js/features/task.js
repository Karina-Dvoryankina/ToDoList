import { genId } from '../utils/genId.js';
export class Task {
    constructor({name, description, dueDate, isPriority, location}) {
        this.id = genId(); 
        this.name = name;
        this.description = description;
        this.dueDate = dueDate;
        this.isPriority = isPriority;
        this.location = location; 
        this.createdAt = new Date().toDateString();
        this.isCompleted = false;
    }
}