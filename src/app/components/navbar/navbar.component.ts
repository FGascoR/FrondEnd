import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core'; 
import { Router } from '@angular/router';        
import { AuthService } from '../../auth.service'; 
import { FormControl } from '@angular/forms'; 
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs'; 

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy { 
  searchTermControl = new FormControl('');
  @Output() onSearch = new EventEmitter<string>(); 
  @Output() onCargarHistorial = new EventEmitter<void>();

  private searchSubscription: Subscription | undefined; 
  constructor(
    private router: Router,
    private authService: AuthService 
  ) { }

  ngOnInit() {
    this.searchSubscription = this.searchTermControl.valueChanges.pipe(
      debounceTime(400), 
      distinctUntilChanged() 
    ).subscribe(value => {
      this.onSearch.emit((value as string).trim());
    });
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  logout() {
    this.authService.logout(); 
    this.router.navigate(['/login']); 
  }
  
  cargarHistorial() {
    this.onCargarHistorial.emit();
  }
}