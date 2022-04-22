import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { KeyboardComponent } from './views/keyboard/keyboard.component';
import { MainComponent } from './views/main/main.component';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAnalytics,getAnalytics,ScreenTrackingService,UserTrackingService } from '@angular/fire/analytics';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAnalyticsModule } from '@angular/fire/compat/analytics';
import { Auth, AuthModule, provideAuth } from '@angular/fire/auth';
import { getAuth } from 'firebase/auth';

@NgModule({
    declarations: [
        AppComponent,
        KeyboardComponent,
        MainComponent
    ],
    imports: [
        BrowserModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireAnalyticsModule,
        AuthModule,
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideAnalytics(() => getAnalytics()),
        provideAuth(() => getAuth())
    ],
    providers: [
        ScreenTrackingService,
        UserTrackingService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
