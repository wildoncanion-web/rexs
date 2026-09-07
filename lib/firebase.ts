"use client"

import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: "investment-holdings.firebaseapp.com",
  projectId: "investment-holdings",
  storageBucket: "investment-holdings.firebasestorage.app",
  messagingSenderId: "496714313908",
  appId: "1:496714313908:web:39828b27a6e43e115027e1",
}

let _app: FirebaseApp | undefined
let _auth: Auth | undefined
let _db: Firestore | undefined

function getApp(): FirebaseApp {
  if (!_app) {
    _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  }
  return _app
}

export function getFirebaseAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getApp())
  }
  return _auth
}

export function getFirebaseDb(): Firestore {
  if (!_db) {
    _db = getFirestore(getApp())
  }
  return _db
}

export { getApp }
export const app = null as unknown as FirebaseApp
export const auth = null as unknown as Auth
export const db = null as unknown as Firestore
