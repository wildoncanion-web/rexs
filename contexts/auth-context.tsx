"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  onAuthStateChanged,
  signOut,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  type User,
} from "firebase/auth"
import { doc, setDoc, getDoc, addDoc, collection, Timestamp } from "firebase/firestore"
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase"
import { isAdmin } from "@/lib/admin"

interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  createdAt: Date
  totalBalance: number
  holdings: {
    BTC: number
    ETH: number
    USDC: number
    USDT: number
    LTC: number
    DOGE: number
  }
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  isAdmin: boolean
  register: (email: string, password: string, displayName: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  sendSignInLink: (email: string, displayName?: string) => Promise<void>
  completeSignIn: (email: string, displayName?: string) => Promise<void>
  logout: () => Promise<void>
  isEmailLink: (url: string) => boolean
  refreshProfile: () => Promise<UserProfile | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [adminStatus, setAdminStatus] = useState(false)

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      setLoading(false)
      return
    }

    const auth = getFirebaseAuth()
    const db = getFirebaseDb()
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      setAdminStatus(isAdmin(user?.email))
      if (user) {
        try {
          const profileDoc = await getDoc(doc(db, "users", user.uid))
          if (profileDoc.exists()) {
            setUserProfile(profileDoc.data() as UserProfile)
          } else {
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email!,
              displayName: user.displayName || user.email!.split("@")[0],
              createdAt: new Date(),
              totalBalance: 0,
              holdings: { BTC: 0, ETH: 0, USDC: 0, USDT: 0, LTC: 0, DOGE: 0 },
            }
            await setDoc(doc(db, "users", user.uid), newProfile)
            setUserProfile(newProfile)
          }
        } catch (error) {
          console.error("Error fetching user profile:", error)
        }
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const register = async (email: string, password: string, displayName: string) => {
    const auth = getFirebaseAuth()
    const db = getFirebaseDb()

    const result = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(result.user, { displayName })

    const newProfile: UserProfile = {
      uid: result.user.uid,
      email: result.user.email!,
      displayName: displayName,
      createdAt: new Date(),
      totalBalance: 0,
      holdings: { BTC: 0, ETH: 0, USDC: 0, USDT: 0, LTC: 0, DOGE: 0 },
    }

    await setDoc(doc(db, "users", result.user.uid), newProfile)
    setUserProfile(newProfile)

    // Create admin notification for new signup
    await addDoc(collection(db, "admin_notifications"), {
      type: "signup",
      userId: result.user.uid,
      userEmail: result.user.email,
      userName: displayName,
      read: false,
      createdAt: Timestamp.now(),
    })
  }

  const login = async (email: string, password: string) => {
    const auth = getFirebaseAuth()
    await signInWithEmailAndPassword(auth, email, password)
  }

  const sendSignInLink = async (email: string, displayName?: string) => {
    const auth = getFirebaseAuth()
    const currentOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"

    const actionCodeSettings = {
      url: `${currentOrigin}/auth/callback`,
      handleCodeInApp: true,
    }

    await sendSignInLinkToEmail(auth, email, actionCodeSettings)

    if (typeof window !== "undefined") {
      window.localStorage.setItem("emailForSignIn", email)
      if (displayName) {
        window.localStorage.setItem("displayNameForSignIn", displayName)
      }
    }
  }

  const isEmailLink = (url: string) => {
    const auth = getFirebaseAuth()
    return isSignInWithEmailLink(auth, url)
  }

  const completeSignIn = async (email: string, displayName?: string) => {
    const auth = getFirebaseAuth()
    const db = getFirebaseDb()

    if (!isSignInWithEmailLink(auth, window.location.href)) {
      throw new Error("Invalid sign-in link")
    }

    const result = await signInWithEmailLink(auth, email, window.location.href)

    window.localStorage.removeItem("emailForSignIn")
    window.localStorage.removeItem("displayNameForSignIn")

    const profileDoc = await getDoc(doc(db, "users", result.user.uid))

    if (!profileDoc.exists()) {
      const newProfile: UserProfile = {
        uid: result.user.uid,
        email: result.user.email!,
        displayName: displayName || email.split("@")[0],
        createdAt: new Date(),
        totalBalance: 0,
        holdings: { BTC: 0, ETH: 0, USDC: 0, USDT: 0, LTC: 0, DOGE: 0 },
      }

      await setDoc(doc(db, "users", result.user.uid), newProfile)
      setUserProfile(newProfile)
    } else {
      setUserProfile(profileDoc.data() as UserProfile)
    }
  }

  const logout = async () => {
    const auth = getFirebaseAuth()
    await signOut(auth)
    setUserProfile(null)
  }

  const refreshProfile = async (): Promise<UserProfile | null> => {
    if (!user) return null
    const db = getFirebaseDb()
    const profileDoc = await getDoc(doc(db, "users", user.uid))
    if (profileDoc.exists()) {
      const updatedProfile = profileDoc.data() as UserProfile
      setUserProfile(updatedProfile)
      return updatedProfile
    }
    return null
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isAdmin: adminStatus,
        register,
        login,
        sendSignInLink,
        completeSignIn,
        logout,
        isEmailLink,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
