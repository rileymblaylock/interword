import { Component, OnInit } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import { Meta, Title } from '@angular/platform-browser';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    title = 'INTERWORD';

    constructor(
        private titleService: Title,
        private metaTagService: Meta,
        public readonly firebaseApp: FirebaseApp
    ) {}

    ngOnInit(): void {
        this.titleService.setTitle("INTERWORD");
        this.metaTagService.addTags([  
            { name: 'keywords', content: 'INTERWORD, INTERWORD game' },
            { name: 'date', content: '2022-04-25', scheme: 'YYYY-MM-DD' },
            { name: 'description', content: 'INTERWORD - an alphabetical word guessing game' },
            { name: 'robots', content: 'index, follow' },
            { charset: 'UTF-8' }
          ]);  
    }
}
