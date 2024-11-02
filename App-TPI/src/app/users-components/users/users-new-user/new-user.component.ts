import { CommonModule, formatDate } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RolModel } from '../../../users-models/users/Rol';
import { UserService } from '../../../users-servicies/user.service';
import { UserGet } from '../../../users-models/users/UserGet';
import { UserPost } from '../../../users-models/users/UserPost';
import { Router, RouterModule } from '@angular/router';
import { UsersSelectMultipleComponent } from "../../utils/users-select-multiple/users-select-multiple.component";
import { DateService } from '../../../users-servicies/date.service';
import { AuthService } from '../../../users-servicies/auth.service';
import Swal from 'sweetalert2';
import { PlotService } from '../../../users-servicies/plot.service';
import { GetPlotDto } from '../../../users-models/plot/GetPlotDto';
import { ValidatorsService } from '../../../users-servicies/validators.service';

@Component({
  selector: 'app-new-user',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, RouterModule, UsersSelectMultipleComponent],
  templateUrl: './new-user.component.html',
  styleUrl: './new-user.component.css'
})
export class NewUserComponent implements OnInit {

  constructor(private router:Router){
    
  }

  private readonly apiService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly plotService = inject(PlotService);
  private readonly validatorService = inject(ValidatorsService);
  @ViewChild(UsersSelectMultipleComponent) rolesComponent!: UsersSelectMultipleComponent;

  rolesSelected : string[] = [];
  roles: RolModel[] = [];
  rolesHtmlString: string = '';  //
  rolesString: string = "Roles añadidos:";
  rolesInput: string[] = [];
  select: string = "";
  checkOption: boolean = false;
  lotes: GetPlotDto[] = [];

  subTitleLabel: string = 'Seleccione los roles del usuario';
  optionsForOwner: string[] = ["Familiar mayor", "Familiar menor"];
  options: string[] = [];
  selectedOptions: string[] = [];
  

  ngOnInit() {
    this.loadRoles();

     //SOLO MUESTRA LOS LOTES DISPONIBLES
     this.plotService.getAllPlotsAvailables().subscribe({
      next: (data: GetPlotDto[]) => {
          if(this.authService.getActualRole() == "Propietario"){
              this.lotes = data.filter(lote => this.authService.getUser().plotId.includes(lote.id));
              this.reactiveForm.get('plot')?.setValue(this.authService.getUser().plotId.toString());
              this.reactiveForm.get('plot')?.disable();

          }else{
            this.lotes = data;
          }
      },
      error: (err) => {
        console.error('Error al cargar los tipos de lote:', err);
      }
    });

    if(this.authService.getActualRole() == "Propietario"){
      this.reactiveForm.controls['plot'].disable();
    }


    this.apiService.getAllRoles().subscribe({
      next: (data: RolModel[]) => {
        this.options = data.map(rol => rol.description);
        if(this.authService.getActualRole() == "Propietario"){
          this.options = this.options.filter(rol => this.optionsForOwner.includes(rol));
        } else{
          this.options = this.options.filter(rol => !this.optionsForOwner.includes(rol) && rol != "Propietario" && rol != "SuperAdmin");
        }
      },
      error: (error) => {
        console.error('Error al cargar los roles:', error);
      }
    });

    if(this.authService.getActualRole() == "Gerente"){
      this.reactiveForm.get("plot")?.disable();
      this.reactiveForm.get("plot")?.setValue("Sin lote");
    }
  }


  reactiveForm = new FormGroup({
    name: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50)
    ]),
    lastname: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50)
    ]),
    username: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(30)
      ],
        this.validatorService.validarUsernameUnico()
    ),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(30)
  ]),
    email: new FormControl('', [
        Validators.required,
        Validators.email
      ],
        this.validatorService.validarEmailUnico()
    ),
    phone_number: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d+$/),
        Validators.minLength(10),
        Validators.maxLength(20)
    ]),
    dniType: new FormControl('', [
      Validators.required
      
    ]),
    dni: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d+$/),
        Validators.minLength(8)
      ],
        this.validatorService.validarDniUnico()
    ),
    telegram_id: new FormControl(0,[
        Validators.required,
        Validators.min(0),
        Validators.minLength(1)
    ]),
    active: new FormControl(true), 
    datebirth: new FormControl(DateService.formatDate(new Date("2000-01-02")), [Validators.required]),
    roles: new FormControl(''),
    plot: new FormControl('', [Validators.required]),
    userUpdateId: new FormControl(this.authService.getUser().id)
  });
  
  //Carga los roles
  loadRoles() {
    this.apiService.getAllRoles().subscribe({
      next: (data: RolModel[]) => {

        this.roles = data;
      },
      error: (error) => {
        console.error('Error al cargar los roles:', error);
        
      }
    });
  }
  
  //Redirige a la ruta especificada 
  redirect(){
    if(this.authService.getActualRole() == "Propietario"){
      this.router.navigate(['/home/family']);
    }else{
      this.router.navigate(['/home/users/list']);
    }
  }

  //Resetear formularios
  resetForm() {
    this.reactiveForm.reset();
    this.rolesInput = [];
  }


  //Añade los roles seleccionados por users-select-multiple
  fillOptionsSelected(options: any) {
    this.selectedOptions = options;  // Asignamos directamente los roles emitidos
  }

verifyOptions() {
    if(this.selectedOptions.length === 0){  
      this.checkOption = false;
    }
    else{
      this.checkOption = true;
    }
  }
  

  //Se crea el usuario
  createUser() {
    
    const fechaValue = this.reactiveForm.get('datebirth')?.value;
    
    const userData : UserPost = {
      name: this.reactiveForm.get('name')?.value || '',
      lastname: this.reactiveForm.get('lastname')?.value || '',
      username: this.reactiveForm.get('username')?.value || '',
      password: this.reactiveForm.get('password')?.value?.toString() || '',
      email: this.reactiveForm.get('email')?.value || '',
      dni_type_id: Number(this.reactiveForm.get('dniType')?.value) || 0,
      dni: this.reactiveForm.get('dni')?.value?.toString() || "",
      active: true,
      avatar_url: "asd",
      datebirth: fechaValue ? new Date(fechaValue).toISOString().split('T')[0] : '',
      roles: this.selectedOptions,
      phone_number: this.reactiveForm.get('phone_number')?.value?.toString() || '',
      userUpdateId: this.reactiveForm.get('userUpdateId')?.value || 0,
      telegram_id: this.reactiveForm.get('telegram_id')?.value || 0
    
    };

    console.log(userData);
    

    //Si el usuario es de tipo owner se setea el plotId
    if(this.authService.getActualRole() == "Propietario"){
      userData.plot_id = this.authService.getUser().plotId[0];  
    }else{
      userData.plot_id = 0;
    }

    console.log(userData);
    
    

    this.apiService.postUser(userData).subscribe({
      next: (response) => {
        //Mostramos que la operación fue exitosa
        (window as any).Swal.fire({
          position: "center-center",
          title: 'Usuario creado',
          text: 'El usuario se ha creado correctamente',
          icon: 'success',
          timer: 1000,
          showConfirmButton: false
        });
        if(this.authService.getActualRole() == "Propietario"){
          this.router.navigate(['/home/family']);
        }
        //Reseteamos el formulario
        this.reactiveForm.reset();
        this.rolesComponent.emptyList();
        
      },
      error: (error) => {
        //Mostramos que hubo un error
        (window as any).Swal.fire({
          position: "center-center",
          title: 'Error',
          text: 'El usuario no se pudo crear',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          
        });
      },
    });
  }

  //Retorna una clase para poner el input en verde o rojo dependiendo si esta validado
  onValidate(controlName: string) {
    const control = this.reactiveForm.get(controlName);
    return {
      'is-invalid': control?.invalid && (control?.dirty || control?.touched),
      'is-valid': control?.valid
    }
  }


  showError(controlName: string): string {
    const control = this.reactiveForm.get(controlName);
  
    if (control && control.errors) {
      const [errorKey] = Object.keys(control.errors);
  
      switch (errorKey) {
        case 'required':
          return 'Este campo no puede estar vacío.';
        case 'email':
          return 'Formato de correo electrónico inválido.';
        case 'minlength':
          return `El valor ingresado es demasiado corto. Mínimo ${control.errors['minlength'].requiredLength} caracteres.`;
        case 'maxlength':
          return `El valor ingresado es demasiado largo. Máximo ${control.errors['maxlength'].requiredLength} caracteres.`;
        case 'min':
          return `El valor es menor que el mínimo permitido (${control.errors['min'].min}).`;
        case 'pattern':
          return 'El formato ingresado no es válido.';
        case 'requiredTrue':
          return 'Debe aceptar el campo requerido para continuar.';
        case 'date':
          return 'La fecha ingresada es inválida.';
        case 'usernameTaken':
          return 'Este nombre de usuario ya está en uso.';
        case 'emailTaken':
          return 'Este correo electrónico ya está en uso.';
        case 'dniTaken':
          return 'Este DNI ya está en uso.';
        default:
          return 'Error no identificado en el campo.';
      }
    }
  
    // Retorna cadena vacía si no hay errores.
    return '';
  }

  showFormError(){
    Object.keys(this.reactiveForm.controls).forEach((field) => {
      const control = this.reactiveForm.get(field);
      if (control && control.errors) {
        console.log(`Errores en ${field}:`, control.errors);
      }
    });
  }
  
}