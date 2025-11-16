import { Component } from '@angular/core';

@Component({
  selector: 'app-panel-admin',
  templateUrl: './panel-admin.component.html',
  styleUrls: ['./panel-admin.component.css']
})
export class PanelAdminComponent {
  libros = Array(8).fill({}); // 👈 Esto crea 8 "libros" simulados
}