import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TabService {
  private selectedTabSubject = new BehaviorSubject<string>('');
  selectedTab$ = this.selectedTabSubject.asObservable();

  setSelectedTab(tab: string) {
    this.selectedTabSubject.next(tab);
  }
}