import { Component, signal } from '@angular/core';
import { Home } from './components/home/home';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [Home],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('TemperoDoSertao');
}
