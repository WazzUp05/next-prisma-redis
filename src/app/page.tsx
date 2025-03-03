"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

export default function Home() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetch("/api/users")
            .then((res) => res.json())
            .then((data) => setUsers(data))
            .catch((error) => console.error("Ошибка:", error));
    }, []);

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <h1>Список пользователей</h1>
                <ul>
                    {users.map((user) => (
                        <li key={user.id}>
                            {user.name} - {user.email}
                        </li>
                    ))}
                </ul>
            </main>
        </div>
    );
}
