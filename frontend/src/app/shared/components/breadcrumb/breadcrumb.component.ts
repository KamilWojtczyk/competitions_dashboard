import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Breadcrumb } from '../../models/breadcrumb.model';
import { selectBreadcrumbs } from '../../../features/competitions/state/competitions.selectors';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
  standalone: true,
  imports: [AsyncPipe, RouterLink, MatIconModule],
})
export class BreadcrumbComponent {
  breadcrumbs$: Observable<Breadcrumb[]>;

  constructor(private store: Store) {
    this.breadcrumbs$ = this.store.select(selectBreadcrumbs);
  }
}
