import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AppComponent } from './app.component';
import { AuthService } from './core/services/auth.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have title BarberPro', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance.title).toBe('BarberPro');
  });
});

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Ignorar la petición de restoreSession si hay token guardado
    const req = httpMock.match(() => true);
    req.forEach(r => r.flush(null, { status: 401, statusText: 'Unauthorized' }));
  });

  afterEach(() => httpMock.verify());

  it('isAuthenticated es false sin sesión activa', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('isAdmin es falsy sin sesión activa', () => {
    expect(service.isAdmin()).toBeFalsy();
  });

  it('getToken devuelve null si no hay token en localStorage', () => {
    localStorage.removeItem('tfg_peluqueria_token');
    expect(service.getToken()).toBeNull();
  });

  it('isTokenExpired devuelve true sin token', () => {
    localStorage.removeItem('tfg_peluqueria_token');
    expect(service.isTokenExpired()).toBe(true);
  });

  it('forgotPassword llama al endpoint correcto', () => {
    service.forgotPassword('test@test.com').subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/auth/forgot-password'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@test.com' });
    req.flush({ message: 'ok' });
  });

  it('resetPassword llama al endpoint correcto', () => {
    service.resetPassword('token123', 'newpass').subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/auth/reset-password'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ token: 'token123', newPassword: 'newpass' });
    req.flush({ message: 'ok' });
  });
});
