import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Task } from '../task';
import { TaskService } from '../task.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css',
})
export class TaskFormComponent implements OnInit {
  task: Task = { title: '', description: '' };
  isEditMode = false;
  loading = false;
  error = '';

  constructor(
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loading = true;
      this.taskService.getTask(id).subscribe({
        next: (task) => {
          this.task = task;
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load task.';
          this.loading = false;
        },
      });
    }
  }

  save(): void {
    if (!this.task.title.trim()) {
      this.error = 'Title is required.';
      return;
    }
    const request = this.isEditMode
      ? this.taskService.updateTask(this.task._id!, this.task)
      : this.taskService.createTask(this.task);

    request.subscribe({
      next: () => this.router.navigate(['/tasks']),
      error: () => (this.error = 'Failed to save task.'),
    });
  }

  cancel(): void {
    this.router.navigate(['/tasks']);
  }
}
