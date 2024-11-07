import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { UserGet } from '../../../users-models/users/UserGet';
import { PlotService } from '../../../users-servicies/plot.service';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalInfoUserComponent } from '../users-modal-info-user/modal-info-user.component';
import { UserService } from '../../../users-servicies/user.service';
import jsPDF from 'jspdf';
import autoTable, { Row } from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import $ from 'jquery';
import { GetPlotDto } from '../../../users-models/plot/GetPlotDto';
import 'datatables.net';
import 'datatables.net-bs5';
import { Router, RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { RolModel } from '../../../users-models/users/Rol';
import { GetPlotModel } from '../../../users-models/plot/GetPlot';
import { UsersMultipleSelectComponent } from "../../utils/users-multiple-select/users-multiple-select.component";


@Component({
  selector: 'app-list-users',
  standalone: true,
  imports: [HttpClientModule, CommonModule, FormsModule, ModalInfoUserComponent, RouterModule, ReactiveFormsModule, UsersMultipleSelectComponent],
  templateUrl: './list-users.component.html',
  styleUrls: ['./list-users.component.css']
})
export class ListUsersComponent implements OnInit {
  selectedOptions: any; 
  optionesFilter: any;

  constructor(private router: Router,private modal: NgbModal, private plotService:PlotService) { }

  typeModal: string = '';
  user: number = 0; 
  users: UserGet[] = [];
  roles: RolModel[] = [];
  private readonly apiService = inject(UserService);
  showDeactivateModal: boolean = false;
  userToDeactivate: number = 0;
  plots : GetPlotDto[] = [];
  selectRol: FormControl = new FormControl('');
  rolesFilter: any[] = [];
  selectedRole: string = '';
  initialDate = new FormControl();
  endDate = new FormControl();

  getPlotByUser(plotId : number){
    this.plotService.getPlotById(plotId).subscribe({
      next: (data: GetPlotModel) =>{
        return data.plot_number;
      }
    })
  }
  
  ngOnInit() {

    this.loadRoles();

    this.plotService.getAllPlots().subscribe({
      next: (data: GetPlotDto[]) => {
        this.plots = data;
        
      }
    }
    )

    //Trae todos los usuarios
    this.apiService.getAllUsers().subscribe({
      next: (data: UserGet[]) => {
        //Cambiar guiones por barras en la fecha de nacimiento
        this.users = data.map(user => ({
          ...user,

          datebirth: user.datebirth.replace(/-/g, '-'),
          create_date: user.create_date.replace(/-/g, '-'),

        }));
      
        //Inicializar DataTables después de cargar los datos
        setTimeout(() => {
          const table = $('#myTable').DataTable({
            paging: true,
            searching: true,
            ordering: true,
            lengthChange: true,
            lengthMenu: [5, 10, 25, 50],
            order: [[0, 'desc']],
            pageLength: 5,
            columns: [
              { title: 'Fecha de creación', width: '20%' },
              { title: 'Nombre', width: '20%' },
              { title: 'Rol', width: '30%'},
              { title: 'Nro. de lote', className: 'text-start', width: '15%' ,
                 render: (data) => { 

                  let plotNumber: GetPlotDto[] = [];

                  data.forEach((d: any) => {
                    const plot = this.plots.find((plot: GetPlotDto) => plot.id == d);
                    if (plot) {
                      plotNumber.push(plot);
                    }
                  });
                  
                  if(plotNumber != undefined){
                    
                    if (plotNumber.length > 0) { 
                      var plots : string = "";
                      for(let i = 0; i < plotNumber.length; i++){
                        plots = plots + plotNumber[i].plot_number + ", ";
                        // borrar la ultima letra del plots
                      }
                      plots = plots.substring(0, plots.length - 2);
                      return plots;
                  } else {
                        return "Sin lote"; 
                    }
                } 
                return "Sin lote"; 
                    

                    }
            },
              {
                title: 'Acciones',
                orderable: false,
                width: '15%',
                className: 'align-middle text-center',
                render: (data, type, row, meta) => {
                  const userId = this.users[meta.row].id;
                  return `
                    <div class="dropdown-center d-flex text-center justify-content-center">
                      <button class="btn btn-light border border-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-three-dots-vertical"></i>
                      </button>
                      <ul class="dropdown-menu">
                        <li><a class="dropdown-item view-user hover" data-id="${meta.row}">Ver más</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item edit-user" data-id="${userId}">Editar</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item delete-user" data-id="${meta.row}">Eliminar</a></li>
                      </ul>
                    </div>
                  `;
                }
              }
            ],
            dom:
            '<"mb-3"t>' +                           
            '<"d-flex justify-content-between"lp>',
            data: this.users.map(user => [
              user.create_date,   
              `${user.lastname}, ${user.name}`,  //Nombre completo
              this.showRole(user.roles),              //Roles
              user.plot_id,                                //Nro. de lote (puedes ajustar esto)                 
              '<button class="btn btn-info">Ver más</button>'  //Ejemplo de acción
            ]),
            language: {
              lengthMenu: "_MENU_",
              zeroRecords: "No se encontraron resultados",
              info: "Mostrando página _PAGE_ de _PAGES_",
              infoEmpty: "No hay registros disponibles",
              infoFiltered: "(filtrado de _MAX_ registros totales)",
              search: "Buscar:",
              loadingRecords: "Cargando...",
              processing: "Procesando...",
              emptyTable: "No hay datos disponibles en la tabla"
            },
          });    

          //Alinear la caja de búsqueda a la derecha
          const searchInputWrapper = $('#myTable_filter');
          searchInputWrapper.addClass('d-flex justify-content-start');

          //Desvincular el comportamiento predeterminado de búsqueda
          $('#myTable_filter input').unbind(); 
          $('#myTable_filter input').bind('input', (event) => { //Usar función de flecha aquí
              const searchValue = (event.target as HTMLInputElement).value; //Acceder al valor correctamente
          
              //Comienza a buscar solo si hay 3 o más caracteres
              if (searchValue.length >= 3) {
                  table.search(searchValue).draw();
              } else {
                  table.search('').draw(); //Limpia la búsqueda si hay menos de 3 caracteres
              }
          });

          //Asignar el evento click a los botones "Ver más"
          //Asignar el evento click a los botones "Ver más"
        $('#myTable').on('click', '.view-user', (event) => {
          const id = $(event.currentTarget).data('id');
          const userId = this.users[id].id; //Obtén el ID real del usuario
          this.openModal("info", userId); //Pasa el ID del usuario al abrir el modal
        });


          $('#myTable').on('click', '.delete-user', (event) => {
            const id = $(event.currentTarget).data('id');
            const userId = this.users[id].id; //Obtén el ID real del usuario
            this.openModal("delete", userId); //Pasa el ID del usuario al abrir el modal
          });

          //Asignar el evento click a los botones "Editar"
          $('#myTable').on('click', '.edit-user', (event) => {
            const userId = $(event.currentTarget).data('id');
            this.redirectEdit(userId); //Redirigir al método de edición
          });


        }, 0); //Asegurar que la tabla se inicializa en el próximo ciclo del evento
      },
      error: (error) => {
        console.error('Error al cargar los usuarios:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al cargar los usuarios. Por favor, inténtalo más tarde.'
          })
        this.router.navigate(['/home']);
      }
    });

  }

  resetFilters() {
    // Reiniciar el valor del control de rol
    this.selectRol.setValue('');
    this.initialDate.setValue('');
    this.endDate.setValue('');
    // Limpiar el campo de búsqueda
    const searchInput = document.getElementById("myTable_search") as HTMLInputElement;
    if (searchInput) {
        searchInput.value = ''; // Limpiar el valor del input
    }

    // Obtener la instancia de DataTable
    $.fn.dataTable.ext.search.pop();
    const table = $('#myTable').DataTable();

    this.rolesFilter = [];
    this.rolesFilter = this.roles.map(r => ({ 
      value: r.description, 
      name: r.description
    }));
    

    table.search('').draw();

    table.column(2).search('').draw();
}

fillOptionsSelected(options: any) {
  this.optionesFilter = options;  // Asignamos directamente los roles emitidos
  var optiones = options.map((option: any) => option).join(' ');
  console.log(optiones);
  
  const table = $('#myTable').DataTable();
  console.log(options);
  
  // Filtrar por roles, pero que contenga 1 o más roles de las optiones, no todos
  $.fn.dataTable.ext.search.push((settings: any, data: any, dataIndex: any) => {
    const roles = data[2].split(' ');
    return options.some((option: any) => roles.includes(option));
  });
}



  updateFilterRol() {
    const table = $('#myTable').DataTable();
    table.column(2).search(this.selectRol.value).draw();
  }

  filterDateStart: string = '';
  filterDateEnd: string = '';
  //Metodo para filtrar la tabla en base a las 2 fechas
  filterByDate() {
    const table = $('#myTable').DataTable();
  
    // Convertir las fechas seleccionadas a objetos Date para comparar
    const start = this.initialDate.value ? new Date(this.initialDate.value) : null;
    const end = this.endDate.value ? new Date(this.endDate.value) : null;
  
    // Agregar función de filtro a DataTable
    $.fn.dataTable.ext.search.push((settings: any, data: any, dataIndex: any) => {
      // Convertir la fecha de la fila (data[0]) a un objeto Date
      const rowDateParts = data[0].split('/'); // Asumiendo que la fecha está en formato DD/MM/YYYY
      const rowDate = new Date(`${rowDateParts[2]}-${rowDateParts[1]}-${rowDateParts[0]}`); // Convertir a formato YYYY-MM-DD
  
      // Realizar las comparaciones
      if (start && rowDate < start) return false;
      if (end && rowDate > end) return false;
      return true;
    });
  
    // Redibujar la tabla después de aplicar el filtro
    table.draw();
  }

  showRole(roles : string[]) : string {
    let rolesA : string = ""
    
    roles.forEach(r =>{
      let color : string = "";
      switch (r) {
        case "Gerente":
          color = "danger";
          break;
        case "Propietario":
          color = "primary";
          break;
        case "Familiar mayor":
          color = "secondary";
          break;
        case "Familiar menor":
          color = "secondary";
          break;
          case "SuperAdmin":
          color = "dark";
          break;
      }

      rolesA = rolesA + (`<button class='btn btn-${color} rounded-pill m-1 hover'>${r}</button>`);
    })
    return rolesA
  }

  
  // showRoleForPdf(role : string) : string {
  //   // Definimos el HTML del botón como una cadena
  //   const buttonHTML: string = role

  //   // Expresión regular para capturar el texto entre `>` y `<`
  //   const match = buttonHTML.match(/>([^<]+)</);

  //   // Verificamos si se encontró un resultado y lo extraemos
  // return buttonValue: string = match ? match[1] : '';
  // }



  //Método para abrir el modal
  async openModal(type: string, userId: number) {  
    //Espera a que se cargue el usuario seleccionado
    try {
      await this.selectUser(userId);

      console.log(this.plots);
      console.log(this.userModal.plot_id);
      
      
      let user : any = this.userModal.plot_id;
      let userPlots : any = [];
      user.forEach((plot: any) => {
        console.log("AA" + plot);
        
        const userPlot = this.plots.find((p: any) => p.id == plot);
        console.log(userPlot);
        
        if (userPlot) {
          userPlots.push(userPlot);
        }
      });

      console.log(userPlots);
      

      //Cuando se carga se abre el modal
      const modalRef = this.modal.open(ModalInfoUserComponent, { size: 'lg', keyboard: false });
      modalRef.componentInstance.typeModal = type; 
      modalRef.componentInstance.userModal = this.userModal;
      modalRef.componentInstance.plotModal = userPlots;

      modalRef.result.then((result) => {        
      });

    } catch (error) {
      console.error('Error al abrir el modal:', error);
    }
  }

  //Cambia el tipo de modal
  changeTypeModal(type: string) {
    this.typeModal = type;
  }

  loadRoles() {
    this.apiService.getAllRoles().subscribe({
      next: (data: RolModel[]) => {

        this.roles = data;
        this.rolesFilter = data.map(r => ({
          value: r.description,
          name: r.description
        }));
      },
      error: (error) => {
        console.error('Error al cargar los roles:', error);
        
      }
    });
  }
  
  //Redirige
  redirectEdit(id: number) {
    this.router.navigate(['/home/users/edit', id]);  
  }

  //Busca el user y se lo pasa al modal
  userModal: UserGet = new UserGet();
  selectUser(id: number): Promise<UserGet> {
    
      //Mostrar una alerta mientras carga
    Swal.fire({
      title: 'Cargando usuario...',
      html: 'Por favor, espera un momento',

      //No deja cerrar clickeando afurea
      allowOutsideClick: false,
      didOpen: () => {

        //Mostrar el indicador de carga
        Swal.showLoading();
      }
    });
    return new Promise((resolve, reject) => {
      this.user = id;
      this.apiService.getUserById(id).subscribe({
        next: (data: UserGet) => {
          this.userModal = data;
          Swal.close(); //Cerrar SweetAlert
          resolve(data); //Resuelve la promesa cuando los datos se cargan
        },
        error: (error) => {
          console.error('Error al cargar el usuario:', error);
          reject(error); //Rechaza la promesa si ocurre un error
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al cargar el usuario. Por favor, inténtalo de nuevo.'
          });
        }
      });
    });
  }

  getContentBetweenArrows(input: string): string[] {
    const matches = [...input.matchAll(/>(.*?)</g)];
    return matches.map(match => match[1]).filter(content => content !== "");
  }

  getPlotById(plotId: number): number {
    const plot = this.plots.find(plot => plot.id === plotId);
    return plot?.plot_number || 0;
  }

  exportPdf() {
    const doc = new jsPDF();
  
    const title = 'Lista de Usuarios';
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(16);
    const textWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - textWidth) / 2, 20);
  
    const columns = ['Fecha de creación', 'Nombre', 'Rol', 'Nro. de lote'];
  
    const table = $('#myTable').DataTable(); 
  
    const visibleRows = table.rows({ search: 'applied' }).data().toArray(); 
  
    const rows = visibleRows.map((row: any) => [
      row[0], // Fecha de creación
      `${row[1]}`,               // Nombre
      `${this.getContentBetweenArrows(row[2])}`, // Rol
      `${this.getPlotById(row[3])}` // Lote
    ]);
  
    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 30, 
      theme: 'striped', 
      headStyles: { fillColor: [0, 0, 0] }, 
      styles: { halign: 'center', valign: 'middle' }, 
      columnStyles: { 
        0: { cellWidth: 50 }, 
        1: { cellWidth: 30 }, 
        2: { cellWidth: 30 }, 
        3: { cellWidth: 50 }, 
        4: { cellWidth: 30 } 
      }, 
    });
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0].replace(/-/g, '_'); 
    const fileName = `${formattedDate}_USUARIOS.pdf`; 
  
    doc.save(fileName); 
  }

  exportExcel() {
    const table = $('#myTable').DataTable();
    const visibleRows = table.rows({ search: 'applied' }).data().toArray(); 
  
    let users = this.users.filter(user => 
      visibleRows.some(row => (row[1]).includes(user.name + ', ' + user.lastname))
    );
  
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(users.map(user => ({
      FechaNacimiento: user.create_date.replace(/-/g, '/'),
      Nombre: `${user.lastname}, ${user.name}`,
      Rol: user.roles.join(', '),
      Lote: this.getPlotById(user.plot_id),
  
    })));
  
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
  
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0].replace(/-/g, '_');
    const fileName = `${formattedDate}_USUARIOS.xlsx`; 
  
    XLSX.writeFile(wb, fileName); 
  }

}
