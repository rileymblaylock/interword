import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { KeyboardComponent } from './views/keyboard/keyboard.component';
import { MainComponent } from './views/main/main.component';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideFunctions,getFunctions } from '@angular/fire/functions';
import { provideAnalytics,getAnalytics,ScreenTrackingService,UserTrackingService } from '@angular/fire/analytics';
import { provideDatabase,getDatabase } from '@angular/fire/database';

@NgModule({
    declarations: [
        AppComponent,
        KeyboardComponent,
        MainComponent
    ],
    imports: [
        BrowserModule,
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideFunctions(() => getFunctions()),
        provideAnalytics(() => getAnalytics()),
        provideDatabase(() => getDatabase())
    ],
    providers: [
        ScreenTrackingService,
        UserTrackingService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
