import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartOptions, ChartType, ChartData } from 'chart.js';
import { provideCharts, BaseChartDirective } from 'ng2-charts';
import { ChatComponent } from '../chat/chat.component';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, NgStyle, BaseChartDirective, FormsModule, ChatComponent],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css',
  providers: [provideCharts()],

})
export class TaskComponent {
  category = [];
  ngOnInit() {

    const saveduser = localStorage.getItem('user');
    if (saveduser) {
      const user = JSON.parse(saveduser);
      this.userService.user = user;
    }
    this.getTasks();
  }
  constructor(
    private userService: UserService,

  ) { }

  getimg(x: string) {
    return this.imgsrc.get(x);
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
  imgsrc: Map<string, string> = new Map([
    ['books',
      "m23.121.879c-1.17-1.17-3.072-1.17-4.242 0l-6.707 6.707c-.756.755-1.172 1.76-1.172 2.828v1.586c0 .552.447 1 1 1h1.586c1.068 0 2.073-.417 2.828-1.172l6.707-6.707c1.164-1.117 1.164-3.126 0-4.243zm-1.414 2.828-6.707 6.707c-.378.378-.88.586-1.414.586h-.586v-.586c0-.526.214-1.042.586-1.414l6.707-6.707c.391-.39 1.023-.39 1.414 0 .388.372.388 1.042 0 1.414zm-9.707 14.293c-.553 0-1-.447-1-1s.447-1 1-1h3c.553 0 1 .447 1 1s-.447 1-1 1zm8-4v5c0 2.757-2.243 5-5 5h-10c-2.757 0-5-2.243-5-5v-14c0-2.757 2.243-5 5-5h9c.553 0 1 .448 1 1s-.447 1-1 1h-9c-1.654 0-3 1.346-3 3v14c0 1.654 1.346 3 3 3h10c1.654 0 3-1.346 3-3v-5c0-.553.447-1 1-1s1 .447 1 1zm-10.833-2.333-1.687 1.687c-.431.431-.995.648-1.561.648-.533 0-1.066-.193-1.491-.582l-.669-.579c-.417-.362-.462-.994-.101-1.411.363-.419.994-.461 1.411-.101l.689.598c.103.093.228.092.307.013l1.687-1.687c.391-.391 1.023-.391 1.414 0s.391 1.023 0 1.414zm0-4.96-1.687 1.687c-.431.431-.995.648-1.561.648-.533 0-1.066-.193-1.491-.582l-.669-.579c-.417-.362-.462-.994-.101-1.411.363-.418.994-.461 1.411-.101l.689.598c.103.094.228.092.307.013l1.687-1.687c.391-.391 1.023-.391 1.414 0s.391 1.023 0 1.414zm0 8.546c.391.391.391 1.023 0 1.414l-1.687 1.687c-.431.431-.995.648-1.561.648-.533 0-1.066-.193-1.491-.582l-.669-.579c-.417-.362-.462-.993-.101-1.411.363-.417.994-.462 1.411-.101l.689.598c.103.093.228.092.307.013l1.687-1.687c.391-.391 1.023-.391 1.414 0z"
    ],
    ['clock',
      "M12,24C5.383,24,0,18.617,0,12S5.383,0,12,0s12,5.383,12,12-5.383,12-12,12Zm0-22C6.486,2,2,6.486,2,12s4.486,10,10,10,10-4.486,10-10S17.514,2,12,2Zm5,10c0-.553-.447-1-1-1h-3V6c0-.553-.448-1-1-1s-1,.447-1,1v6c0,.553,.448,1,1,1h4c.553,0,1-.447,1-1Z"
    ],
    ['back',
      "M17.921,1.505a1.5,1.5,0,0,1-.44,1.06L9.809,10.237a2.5,2.5,0,0,0,0,3.536l7.662,7.662a1.5,1.5,0,0,1-2.121,2.121L7.688,15.9a5.506,5.506,0,0,1,0-7.779L15.36.444a1.5,1.5,0,0,1,2.561,1.061Z"

    ], ['checkbox',
      "m12,0C5.383,0,0,5.383,0,12s5.383,12,12,12,12-5.383,12-12S18.617,0,12,0Zm-.091,15.419c-.387.387-.896.58-1.407.58s-1.025-.195-1.416-.585l-2.782-2.696,1.393-1.437,2.793,2.707,5.809-5.701,1.404,1.425-5.793,5.707Z"
    ],
    ['circle',
      "m12,24C5.383,24,0,18.617,0,12S5.383,0,12,0s12,5.383,12,12-5.383,12-12,12Zm0-23C5.935,1,1,5.935,1,12s4.935,11,11,11,11-4.935,11-11S18.065,1,12,1Z"
    ],
    ['calendar',
      "M19.5,2h-1.5V.5c0-.276-.224-.5-.5-.5s-.5,.224-.5,.5v1.5H7V.5c0-.276-.224-.5-.5-.5s-.5,.224-.5,.5v1.5h-1.5C2.019,2,0,4.019,0,6.5v13c0,2.481,2.019,4.5,4.5,4.5h15c2.481,0,4.5-2.019,4.5-4.5V6.5c0-2.481-2.019-4.5-4.5-4.5ZM4.5,3h15c1.93,0,3.5,1.57,3.5,3.5v1.5H1v-1.5c0-1.93,1.57-3.5,3.5-3.5Zm15,20H4.5c-1.93,0-3.5-1.57-3.5-3.5V9H23v10.5c0,1.93-1.57,3.5-3.5,3.5Zm-.5-9.5c0,.276-.224,.5-.5,.5H5.5c-.276,0-.5-.224-.5-.5s.224-.5,.5-.5h13c.276,0,.5,.224,.5,.5Zm-7,5c0,.276-.224,.5-.5,.5H5.5c-.276,0-.5-.224-.5-.5s.224-.5,.5-.5h6c.276,0,.5,.224,.5,.5Z"],
    ['bin',
      "M 12 1 C 10.071 1 8.3571563 1.3209844 8.2851562 1.3339844 C 8.1091562 1.3679844 7.96525 1.4921094 7.90625 1.6621094 L 7.0546875 4.1171875 C 4.8286875 4.3851875 3.3148906 4.7338125 3.2128906 4.7578125 C 2.9428906 4.8198125 2.7768437 5.0884219 2.8398438 5.3574219 C 2.8938437 5.5884219 3.0991719 5.7441406 3.3261719 5.7441406 C 3.3631719 5.7441406 3.4014531 5.7414219 3.4394531 5.7324219 C 3.4494531 5.7304219 3.7052969 5.6709844 4.1542969 5.5839844 C 3.9552969 7.2609844 3.7695312 9.8702656 3.7695312 12.322266 C 3.7695312 17.628266 4.634875 21.512781 4.671875 21.675781 C 4.711875 21.851781 4.8435781 21.993922 5.0175781 22.044922 C 5.1485781 22.083922 8.2850469 23 11.998047 23 C 15.711047 23 18.847516 22.083922 18.978516 22.044922 C 19.152516 21.993922 19.286172 21.850828 19.326172 21.673828 C 19.362172 21.508828 20.226563 17.583266 20.226562 12.322266 C 20.226562 9.8622656 20.04175 7.2549844 19.84375 5.5839844 C 20.29175 5.6709844 20.546641 5.7304219 20.556641 5.7324219 C 20.827641 5.7954219 21.094203 5.628375 21.158203 5.359375 C 21.220064 5.0909779 21.054085 4.8215916 20.785156 4.7578125 L 20.783203 4.7578125 C 20.680856 4.733504 19.17121 4.3850549 16.945312 4.1171875 L 16.09375 1.6601562 C 16.03475 1.4911562 15.889891 1.3669844 15.712891 1.3339844 C 15.641891 1.3199844 13.929 1 12 1 z M 12 2 C 13.394 2 14.688141 2.1805313 15.244141 2.2695312 L 15.845703 4 C 14.677703 3.889 13.37 3.8105469 12 3.8105469 C 10.63 3.8105469 9.3232969 3.888 8.1542969 4 L 8.7558594 2.2695312 C 9.3088594 2.1815312 10.606 2 12 2 z M 12.001953 4.8105469 C 14.713953 4.8105469 17.227406 5.1363906 18.816406 5.4003906 C 19.024406 7.0133906 19.230469 9.7472656 19.230469 12.322266 C 19.230469 16.665266 18.610109 20.158062 18.412109 21.164062 C 17.562109 21.385063 14.933953 22.001953 12.001953 22.001953 C 9.0699531 22.001953 6.4368906 21.385062 5.5878906 21.164062 C 5.3898906 20.165063 4.7714844 16.699266 4.7714844 12.322266 C 4.7714844 9.7712656 4.9855 6.9733906 5.1875 5.4003906 C 6.7785 5.1363906 9.2899531 4.8105469 12.001953 4.8105469 z M 9.5585938 9.1171875 C 9.2825938 9.1171875 9.0585938 9.3411875 9.0585938 9.6171875 L 9.0585938 17.660156 C 9.0585938 17.936156 9.2825938 18.160156 9.5585938 18.160156 C 9.8345937 18.160156 10.058594 17.936156 10.058594 17.660156 L 10.058594 9.6171875 C 10.058594 9.3411875 9.8345937 9.1171875 9.5585938 9.1171875 z M 14.441406 9.1171875 C 14.165406 9.1171875 13.941406 9.3411875 13.941406 9.6171875 L 13.941406 17.660156 C 13.941406 17.936156 14.165406 18.160156 14.441406 18.160156 C 14.717406 18.160156 14.941406 17.936156 14.941406 17.660156 L 14.941406 9.6171875 C 14.941406 9.3411875 14.717406 9.1171875 14.441406 9.1171875 z "
    ],
    ['edit',
      "m 19.486328,1 c -0.0863,0.00366 -0.172594,0.028922 -0.246094,0.076172 -0.091,0.057 -2.265718,1.4496718 -6.761718,5.8886719 -4.7370004,4.6770002 -5.9851097,6.5118902 -6.0371098,6.5878902 -0.045,0.067 -0.073031,0.14461 -0.082031,0.22461 L 6.0292969,16.875 c -0.016,0.15 0.036578,0.29925 0.1425781,0.40625 0.094,0.095 0.2215156,0.146484 0.3535156,0.146484 0.017,0 0.035734,0.001 0.052734,-0.002 l 3.1386719,-0.328125 c 0.079,-0.008 0.1537031,-0.03608 0.2207031,-0.08008 0.077,-0.05 1.935875,-1.281984 6.671875,-5.958984 4.497,-4.4390003 5.904891,-6.5887346 5.962891,-6.6777346 0.064,-0.1 0.09117,-0.2198907 0.07617,-0.3378906 -0.007,-0.05 -0.175141,-1.2464063 -0.994141,-2.0664063 -0.824,-0.8 -2.031031,-0.9656562 -2.082031,-0.9726563 -0.02875,-0.00375 -0.05717,-0.005125 -0.08594,-0.00391 z m -7.714844,0.5527344 c -4.7359996,-0.002 -8.7528746,1.1443593 -8.9218746,1.1933594 -0.164,0.048 -0.2908438,0.1777968 -0.3398438,0.3417968 -0.047,0.162 -1.1621094,4.0205 -1.1621094,9.1875004 0,5.212 1.1151094,9.029453 1.1621094,9.189453 0.048,0.163 0.1768438,0.29089 0.3398438,0.33789 0.168,0.049 4.1749218,1.195313 8.9199216,1.195313 0.844,0 1.722328,-0.03637 2.611328,-0.109375 0.12,-0.01 0.232407,-0.06339 0.316407,-0.150391 l 7.255859,-7.476562 c 0.082,-0.084 0.131625,-0.1955 0.140625,-0.3125 0.065,-0.895 0.09961,-1.794782 0.09961,-2.675781 0,-0.378001 -0.0066,-0.750282 -0.01758,-1.113282 -0.008,-0.276 -0.245625,-0.469375 -0.515625,-0.484375 l 0.002,0.002 c -0.276,0.008 -0.492375,0.239625 -0.484375,0.515625 0.011,0.354 0.01563,0.713032 0.01563,1.082032 0,0.717 -0.02141,1.448687 -0.06641,2.179687 -3.329,0.316 -5.778812,1.016875 -5.882812,1.046875 -0.164,0.048 -0.290844,0.175844 -0.339844,0.339844 -0.03,0.103 -0.729297,2.516984 -1.029297,6.083984 -0.716,0.05 -1.423469,0.07617 -2.105469,0.07617 -3.9169997,0 -7.4029997,-0.830984 -8.3749998,-1.083984 -0.249,-0.948 -1.0468749,-4.336625 -1.046875,-8.640625 0,-4.2620002 0.8008282,-7.6846252 1.0488282,-8.6406252 0.973,-0.2530001 4.4590468,-1.0839844 8.3730466,-1.0839844 l 0.476563,0.00391 c 0.298,-0.037 0.502812,-0.2171875 0.507812,-0.4921875 0.004,-0.276 -0.216187,-0.5028125 -0.492187,-0.5078125 z m 7.845704,0.4746094 c 0.297,0.067 0.909984,0.2481562 1.333984,0.6601562 0.417,0.418 0.601922,1.0155469 0.669922,1.3105469 -0.408,0.573 -1.991844,2.6726562 -5.714844,6.3476561 -4.061,4.01 -5.991875,5.461531 -6.421875,5.769531 l -2.3945312,0.25 0.2519531,-2.351562 c 0.315,-0.43 1.7868437,-2.335891 5.8398441,-6.3378908 3.734,-3.6869999 5.862547,-5.2514374 6.435547,-5.6484374 z m 0.664062,13.5253902 -5.3125,5.472657 c 0.255,-2.302 0.660219,-4.005719 0.824219,-4.636719 0.631,-0.165 2.320281,-0.570938 4.488281,-0.835938 z"
    ],
    ['doc',
      "m18,11.5c0,.276-.224.5-.5.5H6.5c-.276,0-.5-.224-.5-.5s.224-.5.5-.5h11c.276,0,.5.224.5.5Zm-.5,3.5H6.5c-.276,0-.5.224-.5.5s.224.5.5.5h11c.276,0,.5-.224.5-.5s-.224-.5-.5-.5Zm-.415,3.221c-.035.052-.892,1.279-2.585,1.279-.998,0-1.58-.32-2.255-.69-.696-.383-1.437-.809-2.748-.81-2.121.011-3.348,1.633-3.398,1.702-.164.221-.118.533.103.698.22.165.533.121.699-.101.01-.013.991-1.291,2.603-1.299.986-.031,1.586.315,2.261.687.695.381,1.481.813,2.736.813,2.242,0,3.369-1.652,3.416-1.723.152-.229.091-.537-.138-.691-.226-.153-.536-.095-.693.134Zm4.915-8.235v9.515c0,2.481-2.019,4.5-4.5,4.5H6.5c-2.481,0-4.5-2.019-4.5-4.5V4.5C2,2.019,4.019,0,6.5,0h5.515c1.735,0,3.368.676,4.597,1.904l3.484,3.485c1.228,1.227,1.904,2.859,1.904,4.596Zm-6.096-7.375c-.551-.55-1.2-.959-1.904-1.231v5.12c0,.827.673,1.5,1.5,1.5h5.121c-.273-.704-.682-1.354-1.232-1.904l-3.484-3.485Zm5.096,7.375c0-.335-.038-.663-.096-.985h-5.404c-1.379,0-2.5-1.122-2.5-2.5V1.096c-.323-.058-.651-.096-.985-.096h-5.515c-1.93,0-3.5,1.57-3.5,3.5v15c0,1.93,1.57,3.5,3.5,3.5h11c1.93,0,3.5-1.57,3.5-3.5v-9.515Z"
    ],
    ['detail',
      "M9.5,21H4.5c-1.93,0-3.5-1.57-3.5-3.5V4.5c0-1.93,1.57-3.5,3.5-3.5h6.5v3.5c0,1.38,1.12,2.5,2.5,2.5h3.5v1.5c0,.28,.22,.5,.5,.5s.5-.22,.5-.5c0,0,.01-2.1,0-2.14-.09-.79-.46-1.53-1.03-2.09l-3.24-3.24c-.65-.65-1.55-1.03-2.47-1.03H4.5C2.02,0,0,2.02,0,4.5v13c0,2.48,2.02,4.5,4.5,4.5h5c.28,0,.5-.22,.5-.5s-.22-.5-.5-.5ZM16.27,4.97c.29,.29,.5,.64,.62,1.03h-3.39c-.83,0-1.5-.67-1.5-1.5V1.11c.38,.12,.74,.33,1.03,.62l3.24,3.24Zm1.23,6.03c-3.58,0-6.5,2.92-6.5,6.5s2.92,6.5,6.5,6.5,6.5-2.92,6.5-6.5-2.92-6.5-6.5-6.5Zm0,12c-3.03,0-5.5-2.47-5.5-5.5s2.47-5.5,5.5-5.5,5.5,2.47,5.5,5.5-2.47,5.5-5.5,5.5Zm1-8c0,.55-.45,1-1,1s-1-.45-1-1,.45-1,1-1,1,.45,1,1Zm-.5,2.5v3c0,.28-.22,.5-.5,.5s-.5-.22-.5-.5v-3c0-.28,.22-.5,.5-.5s.5,.22,.5,.5Z"
    ],
    ['tag',
      "M21.68,9.108L13.204,.723C12.655,.173,11.869-.089,11.098,.013L4.209,.955c-.274,.038-.466,.29-.428,.563,.037,.273,.293,.461,.562,.428l6.889-.942c.46-.066,.934,.095,1.267,.427l8.476,8.385c1.356,1.356,1.363,3.569,.01,4.94l-.19,.199c-.209-.677-.58-1.314-1.114-1.848L11.204,4.723c-.549-.55-1.337-.812-2.106-.709l-6.889,.942c-.228,.031-.404,.213-.43,.44l-.765,6.916c-.083,.759,.179,1.503,.72,2.044l8.417,8.326c.85,.85,1.979,1.318,3.181,1.318h.014c1.208-.004,2.341-.479,3.189-1.339l3.167-3.208c.886-.898,1.317-2.081,1.292-3.257l.708-.743c1.732-1.754,1.724-4.6-.022-6.345Zm-2.688,9.643l-3.167,3.208c-.66,.669-1.542,1.039-2.481,1.042h-.011c-.935,0-1.812-.364-2.476-1.027L2.439,13.646c-.324-.324-.48-.77-.431-1.225l.722-6.528,6.502-.889c.462-.063,.934,.095,1.267,.427l8.476,8.385c1.356,1.356,1.363,3.569,.017,4.934ZM8,10c0,.552-.448,1-1,1s-1-.448-1-1,.448-1,1-1,1,.448,1,1Z"
    ],
    ['user',
      "m7.5,13c2.481,0,4.5-2.019,4.5-4.5s-2.019-4.5-4.5-4.5-4.5,2.019-4.5,4.5,2.019,4.5,4.5,4.5Zm0-8c1.93,0,3.5,1.57,3.5,3.5s-1.57,3.5-3.5,3.5-3.5-1.57-3.5-3.5,1.57-3.5,3.5-3.5Zm7.5,17.5v1c0,.276-.224.5-.5.5s-.5-.224-.5-.5v-1c0-3.584-2.916-6.5-6.5-6.5s-6.5,2.916-6.5,6.5v1c0,.276-.224.5-.5.5s-.5-.224-.5-.5v-1c0-4.136,3.364-7.5,7.5-7.5s7.5,3.364,7.5,7.5Zm9-4.637v.637c0,.276-.224.5-.5.5s-.5-.224-.5-.5v-.637c0-3.233-2.63-5.863-5.863-5.863-1.357,0-2.485.307-3.351.91-.228.158-.539.103-.696-.124s-.103-.538.124-.696c1.037-.724,2.357-1.09,3.923-1.09,3.784,0,6.863,3.079,6.863,6.863Zm-6.5-8.863c2.481,0,4.5-2.019,4.5-4.5S19.981,0,17.5,0s-4.5,2.019-4.5,4.5,2.019,4.5,4.5,4.5Zm0-8c1.93,0,3.5,1.57,3.5,3.5s-1.57,3.5-3.5,3.5-3.5-1.57-3.5-3.5,1.57-3.5,3.5-3.5Z"
    ]
  ]);

  ////////////////////////////////////////// API ////////////////////////////////////////////

  getTasks() {
    return this.userService.getTasks(this.tabfocus);
  }


  async togglemaincheck(main: any, task_id: number) {
    try {
      const res = await fetch(`http://localhost:4000/updatemainstatus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ update_task: main, task_id: task_id })
      });

      const data = await res.json();

      await this.getTasks();  // รอโหลดทั้งหมดก่อน
      this.showTask = this.alltasks.find(task => task.task_id === data.task_id);
    } catch (err) {
      console.error('❌ Error:', err);
    }
  }


  async togglesubcheck(main: any, sub: any, task_id: number) {
    try {
      const res = await fetch(`http://localhost:4000/updatesubstatus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ main: main, sub: sub, task_id: task_id })
      });

      const data = await res.json();

      await this.getTasks();
      this.showTask = this.alltasks.find(task => task.task_id === data.task_id);
    } catch (err) {
      console.error('❌ Error:', err);
    }
  }

  async bookmark(x: boolean, task_id: number) {
    console.log('press bookmark')
    const target = this.alltasks.find(task => task.task_id === task_id);
    if (target) {
      target.bookmark = !x;
    }

    try {
      const res = await fetch(`http://localhost:4000/updatebookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ismark: !x, task_id: task_id })
      });
      // const data = await res.json();

    } catch (err) {
      console.error('❌ Error:', err);
    }
  }
  noRoomTasks: { [key: string]: boolean } = {};
  room_task: { task_id: number, title: string } | null = null;
  iscreateroom: boolean = false;
  room_name = '';

  cancel() {
    this.room_task = null;
  }
  create() {
    this.iscreateroom = true;
  }
  cancelroom() {
    this.iscreateroom = false;
    this.room_task = null;

  }
  async submitroom() {
    this.userService.ws.send(JSON.stringify({ userId: this.userService.user?.userid, type: "create_room", roomName: this.room_name }));
    this.userService.getRoom('All');
    const task = this.alltasks.find(t => t.task_id === this.room_task?.task_id);

    const res = await fetch(`http://localhost:4000/updatetasksbyroomid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: this.userService.user?.userid, roomName: this.room_name, task_id: this.room_task?.task_id })
    });

    const data = await res.json();
    if (task) {
      task.room_id = data.roomid;
    }

    this.iscreateroom = false;
    this.room_task = null;

  }

  async roomchat(roomid: string, task_id: number, title: string) {
    this.room_task = { task_id: task_id, title: title };
    console.log('press room chat')
    if (roomid === null) {
      this.noRoomTasks[task_id] = true;
    } else {
      delete this.noRoomTasks[task_id];
      const room = this.userService.allrooms.find(r => r.roomid === roomid);
      await this.userService.changeChat(room, 'room')
    }
  }


  /////////////////////////////////////////task/////////////////////////////////////////////

  get alltasks() {
    return this.userService.alltasks;
  }

  tab = ['All', 'Mytask', 'Teamtask', 'Deadline', 'Completed']
  tabfocus = 'All';
  chtabfocus(x: string) {
    this.tabfocus = x;
    this.getTasks();
  }

  icons: Array<string[]> = [
    ['bookmark',
      "M2.849,23.55a2.954,2.954,0,0,0,3.266-.644L12,17.053l5.885,5.853a2.956,2.956,0,0,0,2.1.881,3.05,3.05,0,0,0,1.17-.237A2.953,2.953,0,0,0,23,20.779V5a5.006,5.006,0,0,0-5-5H6A5.006,5.006,0,0,0,1,5V20.779A2.953,2.953,0,0,0,2.849,23.55Z"
    ],
    ['roomchat',
      "m7.5 13a4.5 4.5 0 1 1 4.5-4.5 4.505 4.505 0 0 1 -4.5 4.5zm7.5 7a5.006 5.006 0 0 0 -5-5h-5a5.006 5.006 0 0 0 -5 5v4h15zm2.5-11a4.5 4.5 0 1 1 4.5-4.5 4.505 4.505 0 0 1 -4.5 4.5zm1.5 2h-5a4.793 4.793 0 0 0 -.524.053 6.514 6.514 0 0 1 -1.576 2.216 7.008 7.008 0 0 1 5.1 6.731h7v-4a5.006 5.006 0 0 0 -5-5z"
    ]

  ];


  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  getDate(i: Date | string): string {
    const date = new Date(i);
    const day = date.getDate();
    const month = this.months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  categoryColor: Map<string, Array<string>> = new Map([
    ['Work', ['#fcf4ecff', '#f37e00ff']], ['Homework', ['#efecfc', '#46359a']]
  ])
  tagColor: Map<string, Array<string>> = new Map([
    ['Work', ['#efecfd', '#413291']], ['Homework', ['#f4f9f5', '#359b74']]
  ])

  getcategoryColor(x: string) {
    return this.categoryColor.get(x)!;
  }
  getarraycategory(x: string) {
    return x.split(',')
  }

  getCheckIconByStatus(status: string): string {
    return status === 'completed' ? this.getimg('checkbox')! : this.getimg('circle')!;
  }

  /////////////////////////////////////////////show task////////////////////////////////


  @ViewChild('showtask') boxRef!: ElementRef<HTMLDivElement>;

  showTask: any = [];
  isShowTask = false;
  boxIndex: number | null = null;

  showtasks() {
    const task = this.boxRef.nativeElement;
    task.classList.add('expand');

  }
  closetask() {
    const showtask = this.boxRef.nativeElement;
    showtask.classList.remove('expand');
  }

  changeTask(newTask: any, i: number) {
    this.showTask = newTask;
    this.category = this.showTask.category.split(',');

    if (this.boxIndex === null) {
      this.boxIndex = i;
      this.showtasks();
    }
    else if (this.boxIndex === i) {
      this.closetask();
      this.isShowTask = false;
      this.boxIndex = null;
      if (this.isShowTask = false) {
        setTimeout(() => {
          this.showTask = [];
        }, 1000);
      }

    } else {
      this.boxIndex = i
      if (!this.isShowTask) {
        this.showtasks();
      }
    }
    console.log('show task= ', this.showTask)

  }

  getDeadline(start: Date, end: Date): Array<string> {
    const now = new Date();
    const nowTime = now.getTime();
    const startTime = (new Date(start)).getTime();
    const endTime = (new Date(end)).getTime();

    if (nowTime < startTime) {
      const diffDays = Math.ceil((startTime - nowTime) / (1000 * 60 * 60 * 24));
      return [`Starts in ${diffDays} day${diffDays > 1 ? 's' : ''}`, '#dcedd8ff', '#1ca425ff'];
    }

    if (nowTime >= startTime && nowTime <= endTime) {
      const diffDays = Math.ceil((endTime - nowTime) / (1000 * 60 * 60 * 24));

      if (diffDays >= 7) {
        const week = Math.floor(diffDays / 7);
        return [`${week} week${week > 1 ? 's' : ''} left`, '#dcedd8ff', '#1ca425ff'];
      } else if (diffDays <= 3 && diffDays > 0) {
        return [`${diffDays} day${diffDays !== 1 ? 's' : ''} left`, '#ffededff', '#db1c1cff'];
      } else {
        return [`${diffDays} day${diffDays !== 1 ? 's' : ''} left`, '#ebebebff', '#bac21dff'];
      }
    }

    const overdueDays = Math.ceil((nowTime - endTime) / (1000 * 60 * 60 * 24));
    return [`Overdue by ${overdueDays} day${overdueDays > 1 ? 's' : ''}`, '#f5f5f5ff', '#878787ff'];
  }


  getPercent(task: any) {
    return this.userService.getPercent(task);
  }


  progressChartOptions: ChartOptions<'bar'> = {
    indexAxis: 'y', // แนวนอน
    responsive: true,
    maintainAspectRatio: false, // สำคัญมาก! ปล่อยให้ height ตาม container
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    },
    scales: {
      x: {
        display: false,
        stacked: true, // ให้ bar ซ้อนกันเหมือน progress
        min: 0
      },
      y: {
        display: false,
        stacked: true
      }
    }
  };


  assignProgressChart(task: Array<Array<{ tasks: string, status: string, subtasks: Array<{ subtask: string, status: string }> }>>): ChartData<'bar', number[], string> {

    const number = this.getPercent(task);
    let done = number[2];
    let total = number[1];

    // fallback ถ้า total == 0 (เพื่อให้ bar แสดง)
    if (total === 0) {
      total = 1;
    }

    return {
      labels: ['Progress'],
      datasets: [
        {
          data: [done],
          backgroundColor: '#4caf50', // เขียว
          barThickness: 10
        },
        {
          data: [total - done],
          backgroundColor: '#e0e0e0',
          barThickness: 10
        }
      ]
    };
  }

  ///////////////////////////////////////////////////////////////
  // TypeScript (Angular)
  selectedFile: File | null = null;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      console.log('file = ', file)
    }
  }

  async uploadProfile() {
    if (!this.selectedFile) {
      alert('กรุณาเลือกไฟล์ก่อน');
      return;
    }
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('userid', String(this.userService.user!.userid)); //รับเเค่ string

    const res = await fetch('http://localhost:4000/upload', {
      method: 'POST',
      body: formData

    })

    const data = await res.json();
    alert(data.message)

  }




}
