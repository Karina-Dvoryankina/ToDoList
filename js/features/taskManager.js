import { Task } from "./task.js";
import { SnackBar } from './snackBar.js';
import { Storage } from '../utils/storage.js';

export class TaskManager{
    storageKey = 'tasks';

    filters = {
        tasks: (tab, tasks) => this.filtersTaskOfDefault(tab, tasks),
        today: (tab, tasks) => this.filtersTaskOfToday(tab, tasks),
        upcoming: (tab, tasks) => this.filtersTaskOfUpcoming(tab, tasks),
        priority: (tab, tasks) => this.filtersTaskOfPriority(tab, tasks),
        completed: (tab, tasks) => this.filtersTaskOfCompleted(tab, tasks),
        project: (tab, tasks) => this.filtersTaskOfProject(tab, tasks),
    }

    constructor(){
        this.tasksMap = new Map();
        this.snackBar = new SnackBar();
        this.subscribers = new Set();
        this.loadTasks();
    }

    subscribe(cb) {
        this.subscribers.add(cb);
        return () => this.subscribers.delete(cb);
    }

    notify() {
        const tasks = this.getAllTasks();
        this.subscribers.forEach(cb => {
            try { cb(tasks); } catch(e){ console.error('Subscriber error', e); }
        });
    }

    addTask(taskData){
        try{
            const newTask = new Task(taskData);
            this.tasksMap.set(newTask.id, newTask);
            this.saveTasks();

            this.snackBar.show('Задача успешно добавлена','success');
            console.log('addTask new',newTask);

            this.notify();
            return newTask;
        }
        catch(error){
            this.snackBar.show('Не удалось добавить задачу','error');
            return null;
        }
    }

    deleteTask(taskId = null){
        try{
            this.tasksMap.delete(taskId);
            this.saveTasks();

            this.snackBar.show('Задача успешно удалена','success');
            console.log('deleteTask id',taskId);

            this.notify();
            return true;
        }
        catch(error){
            this.snackBar.show('Не удалось удалить задачу','error');
            return false;
        }
    }

    saveTasks(){
        const taskArray = this.getAllTasks();
        Storage.saveInStorage(this.storageKey, taskArray);
    }

    loadTasks(){
        const storedTasks = Storage.loadFromStorage(this.storageKey);
        storedTasks.forEach(task => {
            this.tasksMap.set(task.id, task);
        })
    }

    getAllTasks(){
        return Array.from(this.tasksMap.values());
    }

    filtersTask(tab) {
        const { type = 'tasks' } = tab;
        const tasks = this.getAllTasks();
        const filtered = this.filters[type](tab, tasks) || [];

        if (['completed'].includes(type)) {
            return this.wrapTasksInUnifiedGroup(filtered);
        }

        return this.groupTasksByDate(filtered);
    }

    wrapTasksInUnifiedGroup(tasks = []) {
        return {
            overdue: {},
            groupedByDate: {
                'Все задачи': tasks
            },
            length: tasks.length
        };
    }

    filtersTaskOfProject(tab, tasks){
        return tasks.filter(task =>
            !task.isCompleted && 
            task.location.type === tab.type &&
            task.location.idProject === tab.id
        )
    }

    filtersTaskOfDefault(tab, tasks){
        return tasks.filter(task => 
            !task.isCompleted && 
            task.location.type === 'default');
    }

    filtersTaskOfToday(tab, tasks){
        return tasks.filter(task => 
            !task.isCompleted && 
            task.dueDate && 
            this.isToday(task.dueDate) 
        );
    }

    toFormatCompareDate(dateString) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const inputDate = new Date(dateString);
        inputDate.setHours(0, 0, 0, 0);

        return { today, inputDate };
    }

    isToday(dateString) {
        const { today, inputDate } = this.toFormatCompareDate(dateString);
        return inputDate.getTime() <= today.getTime();
    }


    filtersTaskOfUpcoming(tab, tasks){
        return tasks.filter(task => 
            !task.isCompleted && 
            task.dueDate && 
            this.isUpcoming(task.dueDate)
        );
    }

    isUpcoming(dateString){
        const dates = this.toFormatCompareDate(dateString);        
        return dates.inputDate > dates.today;
    }

    filtersTaskOfPriority(tab, tasks){
        return tasks.filter(task => 
            !task.isCompleted && 
            task.isPriority
        );
    }

    filtersTaskOfCompleted(tab, tasks){
        return tasks.filter(el => el.isCompleted);
    }

    updatePriority(taskId){
        const task = this.findTaskById(taskId);
        
        if (!task) {
            this.snackBar.show('Не удалось изменить важность задачи', 'error');
            return false;
        }
        task.isPriority = !task.isPriority;
        this.saveTasks();

        this.notify();
        return true;
    }

    findTaskById(taskId){
        return this.tasksMap.get(taskId) || null;
    }

    updateCompleted(taskId){
        try{
            const task = this.findTaskById(taskId);
            task.isCompleted = !task.isCompleted;
            this.saveTasks();

            this.notify();

            this.snackBar.show('Задача успешно выполнена','success');
            console.log('deleteTask id',taskId);

            return true;
        }
        catch(error){            
            this.snackBar.show('Не удалось изменить статус задачи', 'error');
            return false;
        }
        
    }

    groupTasksByDate(tasks = []) {
        const groups = {
            overdue: {},
            groupedByDate: {},
            length: tasks.length
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const task of tasks) {
            if (task.isCompleted) continue;

            if (!task.dueDate) {
                this.addTaskToGroupByDate('Бессрочно', task, groups.groupedByDate);
                continue;
            }

            const taskDate = new Date(task.dueDate);
            taskDate.setHours(0, 0, 0, 0);

            if (taskDate < today) {
                this.addTaskToGroupByDate('Просрочено', task, groups.overdue);
            } else {
                const dateKey = taskDate.toDateString();
                this.addTaskToGroupByDate(dateKey, task, groups.groupedByDate);
            }
        }

        const sortedGrouped = {};
        Object.keys(groups.groupedByDate)
            .filter(key => key !== 'Бессрочно')
            .sort((a, b) => new Date(a) - new Date(b))
            .forEach(key => {
                sortedGrouped[key] = groups.groupedByDate[key];
            });

        if (groups.groupedByDate['Бессрочно']) {
            sortedGrouped['Бессрочно'] = groups.groupedByDate['Бессрочно'];
        }

        groups.groupedByDate = sortedGrouped;
        return groups;
    }

    addTaskToGroupByDate(groupKey, task, groups){
        if (!groupKey || !task) return;

        groups[groupKey] = groups[groupKey] || [];
        groups[groupKey].push(task);
    }
}