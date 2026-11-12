
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";

const exercisesRef = (uid) => collection(db, "users", uid, "exercises");

const toExercise = (snapshot) => ({ id: snapshot.id, ...snapshot.data() });

export async function fetchExercises(uid, { status = "All", order = "asc" } = {}) {
  const ref = exercisesRef(uid);
  const q = status === "All" ? ref : query(ref, where("status", "==", status));
  const snapshot = await getDocs(q);

  const list = snapshot.docs.map(toExercise);
  list.sort((a, b) => a.createdAt - b.createdAt);
  return order === "desc" ? list.reverse() : list;
}

export async function fetchExercise(uid, id) {
  const snapshot = await getDoc(doc(db, "users", uid, "exercises", id));
  if (!snapshot.exists()) return null;
  return toExercise(snapshot);
}

export async function createExercise(uid, { name, muscle, sets = 3 }) {
  const ref = await addDoc(exercisesRef(uid), {
    name,
    muscle,
    sets,
    status: "Planned",
    createdAt: Date.now(),
  });
  return ref.id;
}

export function updateExercise(uid, id, changes) {
  return updateDoc(doc(db, "users", uid, "exercises", id), changes);
}

export function deleteExercise(uid, id) {
  return deleteDoc(doc(db, "users", uid, "exercises", id));
}

export async function addSampleExercises(uid) {
  const samples = [
    { name: "Bench Press", muscle: "Chest", sets: 4, status: "Planned" },
    { name: "Squats", muscle: "Legs", sets: 3, status: "In Progress" },
    { name: "Pull Ups", muscle: "Back", sets: 3, status: "Completed" },
  ];
  const batch = writeBatch(db);
  const now = Date.now();
  samples.forEach((exercise, index) => {
    batch.set(doc(exercisesRef(uid)), { ...exercise, createdAt: now + index });
  });
  await batch.commit();
}
