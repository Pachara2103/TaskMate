import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { ChartOptions, ChartType, ChartData } from 'chart.js';
import { provideCharts, BaseChartDirective } from 'ng2-charts';


@Component({
  selector: 'app-mytask',
  imports: [NgFor, NgIf, BaseChartDirective],
  standalone: true,
  providers: [provideCharts()],
  templateUrl: './mytask.component.html',
  styleUrl: './mytask.component.css'
})
export class MytaskComponent {

  testlist = [1, 2, 3, 4, 5]

  tab = ['All', 'Started', 'Completed', 'test']

  ngOnInit(){
    const list = this.testt.split(',');
    const sub = list[1].split('/');

    // console.log('testt split= ',this.testt.split(','), 'sub split= ', sub);
  }

  testt ='test,sub1/sub2,test2,sub1';
  test = false;
  c() {
    // console.log('click to xcpand')
    this.test = !this.test;
  }

  getimg(x: string) {
    return this.imgsrc.get(x);
  }

  imgsrc: Map<string, string> = new Map([
    ['books',
      "m23.121.879c-1.17-1.17-3.072-1.17-4.242 0l-6.707 6.707c-.756.755-1.172 1.76-1.172 2.828v1.586c0 .552.447 1 1 1h1.586c1.068 0 2.073-.417 2.828-1.172l6.707-6.707c1.164-1.117 1.164-3.126 0-4.243zm-1.414 2.828-6.707 6.707c-.378.378-.88.586-1.414.586h-.586v-.586c0-.526.214-1.042.586-1.414l6.707-6.707c.391-.39 1.023-.39 1.414 0 .388.372.388 1.042 0 1.414zm-9.707 14.293c-.553 0-1-.447-1-1s.447-1 1-1h3c.553 0 1 .447 1 1s-.447 1-1 1zm8-4v5c0 2.757-2.243 5-5 5h-10c-2.757 0-5-2.243-5-5v-14c0-2.757 2.243-5 5-5h9c.553 0 1 .448 1 1s-.447 1-1 1h-9c-1.654 0-3 1.346-3 3v14c0 1.654 1.346 3 3 3h10c1.654 0 3-1.346 3-3v-5c0-.553.447-1 1-1s1 .447 1 1zm-10.833-2.333-1.687 1.687c-.431.431-.995.648-1.561.648-.533 0-1.066-.193-1.491-.582l-.669-.579c-.417-.362-.462-.994-.101-1.411.363-.419.994-.461 1.411-.101l.689.598c.103.093.228.092.307.013l1.687-1.687c.391-.391 1.023-.391 1.414 0s.391 1.023 0 1.414zm0-4.96-1.687 1.687c-.431.431-.995.648-1.561.648-.533 0-1.066-.193-1.491-.582l-.669-.579c-.417-.362-.462-.994-.101-1.411.363-.418.994-.461 1.411-.101l.689.598c.103.094.228.092.307.013l1.687-1.687c.391-.391 1.023-.391 1.414 0s.391 1.023 0 1.414zm0 8.546c.391.391.391 1.023 0 1.414l-1.687 1.687c-.431.431-.995.648-1.561.648-.533 0-1.066-.193-1.491-.582l-.669-.579c-.417-.362-.462-.993-.101-1.411.363-.417.994-.462 1.411-.101l.689.598c.103.093.228.092.307.013l1.687-1.687c.391-.391 1.023-.391 1.414 0z"
    ],
    ['clock',
      "M12,24C5.383,24,0,18.617,0,12S5.383,0,12,0s12,5.383,12,12-5.383,12-12,12Zm0-22C6.486,2,2,6.486,2,12s4.486,10,10,10,10-4.486,10-10S17.514,2,12,2Zm5,10c0-.553-.447-1-1-1h-3V6c0-.553-.448-1-1-1s-1,.447-1,1v6c0,.553,.448,1,1,1h4c.553,0,1-.447,1-1Z"
    ]
  ]);

  trackByIndex(index: number, item: any): number {
    return index;
  }


  showtask = new Map<string, string>();
  isshowtask = false;

  showTask(task: Map<string, Array<string>>) {
    this.isshowtask = !this.isshowtask;
    this.showtask.set('title', task.get('title')![0]);
    this.showtask.set('des', task.get('Description')![0]);
  }

  tasks: Array<Map<string, Array<string>>> = [
    new Map<string, Array<string>>([
      ['title', ['first title']],
      ['Description', ['test des']],
      ['type', ['homework']],
      ['tasks', ['1', '2', '1']],
      ['deadline', [`${new Date()}`, `${new Date('2025-07-06')}`]],
      ['member', ['images/user.png']],
      ['tasks',['']]
    ])

  ];

  getArrayData(task: Map<string, Array<string>>, key:string){
    // console.log('array data= ',  task.get(key));
    return  task.get(key);
  }

  getDeadline(s: string, e: string) {
    const start = new Date(s);
    const end = new Date(e);

    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // console.log(`เหลืออีก ${diffDays} วัน`);
    return Math.max(0, diffDays);
  }




  getC(task: string[]) {
    return task.filter(t => t === '1').length;
  }

  doughnutChartType: ChartType = 'doughnut';


  getPercent(task: string[]) {
    return Math.round((task.filter(t => t === '1').length / task.length) * 100);
  }

  doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    // rotation: -Math.PI / 2,      
    // circumference: 540,
    cutout: '60%', // ทำให้เป็นวงแหวน
    plugins: {
      legend: {
        display: false
      }
    }
  };
  assigncharts(task: string[]): ChartData<'doughnut', number[], string> {
    const done = this.getC(task);
    const notDone = task.length - done;

    return {
      // labels: [`${this.getPercent(task)}%`],
      datasets: [
        {
          data: [notDone, done],
          backgroundColor: ['#e0e0e0', '#4caf50'], // เขียว / เทา
          hoverBackgroundColor: ['#bdbdbd', '#388e3c']
        }
      ]
    };
  }
}
