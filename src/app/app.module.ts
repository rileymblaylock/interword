import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { KeyboardComponent } from './views/keyboard/keyboard.component';
import { MainComponent } from './views/main/main.component';

@NgModule({
    declarations: [
        AppComponent,
        KeyboardComponent,
        MainComponent
    ],
    imports: [
        BrowserModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
