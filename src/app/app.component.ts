import { Component, OnInit } from '@angular/core';
// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";

import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    // Your web app's Firebase configuration

    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    
    ngOnInit(): void {
        const firebaseConfig = {
            apiKey: "AIzaSyD7WBtbGxEecnPS66TijvxXRHUGezs8mHY",
            authDomain: "interword-game.firebaseapp.com",
            projectId: "interword-game",
            storageBucket: "interword-game.appspot.com",
            messagingSenderId: "659695673720",
            appId: "1:659695673720:web:1fb9117a87ac39cf1b288d",
            measurementId: "G-Q0KQEXP97P"
        };
        const app = initializeApp(firebaseConfig);
        const analytics = getAnalytics(app);
    }

    title = 'interword';
}
