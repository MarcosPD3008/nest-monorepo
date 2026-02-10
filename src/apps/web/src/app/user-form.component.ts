import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import {
  validateEmail,
  validatePassword,
  validateUserRegistration,
  capitalize,
  formatDate,
  isValidEmail
} from '@libs/shared';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="user-form">
      <h2>User Registration</h2>

      <form (ngSubmit)="onSubmit()" #form="ngForm">
        <div class="form-group">
          <label for="firstName">First Name:</label>
          <input
            type="text"
            id="firstName"
            [(ngModel)]="user.firstName"
            name="firstName"
            required
            #firstName="ngModel"
          />
          <div class="error" *ngIf="firstName.invalid && firstName.touched">
            First name is required
          </div>
        </div>

        <div class="form-group">
          <label for="lastName">Last Name:</label>
          <input
            type="text"
            id="lastName"
            [(ngModel)]="user.lastName"
            name="lastName"
            required
            #lastName="ngModel"
          />
          <div class="error" *ngIf="lastName.invalid && lastName.touched">
            Last name is required
          </div>
        </div>

        <div class="form-group">
          <label for="email">Email:</label>
          <input
            type="email"
            id="email"
            [(ngModel)]="user.email"
            name="email"
            required
            email
            #email="ngModel"
          />
          <div class="error" *ngIf="email.invalid && email.touched">
            Please enter a valid email
          </div>
          <div class="error" *ngIf="email.valid && !isValidEmail(user.email)">
            Email format is invalid
          </div>
        </div>

        <div class="form-group">
          <label for="password">Password:</label>
          <input
            type="password"
            id="password"
            [(ngModel)]="user.password"
            name="password"
            required
            #password="ngModel"
            (input)="onPasswordChange()"
          />
          <div class="error" *ngIf="password.invalid && password.touched">
            Password is required
          </div>
          <div class="error" *ngIf="password.valid && passwordValidation?.message">
            {{ passwordValidation?.message }}
          </div>
        </div>

        <button type="submit" [disabled]="!form.valid || isSubmitting">
          {{ isSubmitting ? 'Registering...' : 'Register' }}
        </button>
      </form>

      <div class="demo-section">
        <h3>Shared Utilities Demo</h3>
        <p><strong>Capitalize:</strong> {{ capitalizeDemo }}</p>
        <p><strong>Current Date:</strong> {{ currentDate }}</p>
        <p><strong>Validation Errors:</strong></p>
        <ul *ngIf="registrationValidation?.errors">
          <li *ngFor="let error of getErrorKeys()">
            {{ error }}: {{ getErrorMessage(error) }}
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .user-form {
      max-width: 500px;
      margin: 0 auto;
      padding: 20px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }

    input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .error {
      color: red;
      font-size: 0.9em;
      margin-top: 5px;
    }

    button {
      background: #007bff;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .demo-section {
      margin-top: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 4px;
    }
  `]
})
export class UserFormComponent {
  constructor(private http: HttpClient) {}

  user = {
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  };

  isSubmitting = false;
  passwordValidation: { isValid: boolean; message?: string } | null = null;
  registrationValidation: { isValid: boolean; errors: Record<string, string> } | null = null;

  // Computed properties for template
  get capitalizeDemo(): string {
    return capitalize('hello world');
  }

  get currentDate(): string {
    return formatDate(new Date());
  }

  // Utility functions from shared library
  capitalize = capitalize;
  formatDate = formatDate;
  isValidEmail = isValidEmail;

  onPasswordChange() {
    if (this.user.password) {
      this.passwordValidation = validatePassword(this.user.password);
    } else {
      this.passwordValidation = null;
    }
  }

  getErrorKeys(): string[] {
    return this.registrationValidation?.errors ? Object.keys(this.registrationValidation.errors) : [];
  }

  getErrorMessage(key: string): string {
    return this.registrationValidation?.errors?.[key] || '';
  }

  onSubmit() {
    this.isSubmitting = true;

    // Use shared validation
    this.registrationValidation = validateUserRegistration(this.user);

    if (this.registrationValidation.isValid) {
      // Make real API call
      const userData = {
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email
      };

      this.http.post(`${environment.apiUrl}/users`, userData)
        .subscribe({
          next: (response) => {
            console.log('Registration response:', response);
            alert('User registered successfully!');
            this.resetForm();
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error('Registration error:', error);
            alert('Registration failed. Please try again.');
            this.isSubmitting = false;
          }
        });
    } else {
      this.isSubmitting = false;
    }
  }

  private resetForm() {
    this.user = {
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    };
    this.registrationValidation = null;
    this.passwordValidation = null;
  }
}