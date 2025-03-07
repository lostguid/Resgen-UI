import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { HSStaticMethods } from 'preline/preline';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements AfterViewInit, OnDestroy {
  private observer!: MutationObserver;

  ngAfterViewInit(): void {
    HSStaticMethods.autoInit();
    this.observer = new MutationObserver(() => {
      HSStaticMethods.autoInit();
    });
    this.observer.observe(document.body, { attributes: true, subtree: true, childList: true, characterData: true });
  }

  ngOnDestroy(): void {
    this.observer.disconnect();
  }
}
