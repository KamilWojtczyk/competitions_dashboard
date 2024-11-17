import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './features/footer/footer.component';
import { NavbarComponent } from './features/navbar/navbar.component';
import { BreadcrumbComponent } from './shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    FooterComponent,
    NavbarComponent,
    BreadcrumbComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  isMobile: boolean = false;

  ngOnInit() {
    this.checkScreenSize();
  }

  @HostListener('window:resize', [])
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }
}
