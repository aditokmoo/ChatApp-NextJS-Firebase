import { db } from "@/lib/firebase";
import { arrayRemove, arrayUnion, collection, doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

export async function startChat(currentUser: any, user: any) {
    console.log(currentUser)
    console.log(user)
    try {
        const chatRef = collection(db, 'chats');
        const userChatsRef = collection(db, 'userChats');

        const chatId = currentUser?.id < user?.id
            ? `${currentUser?.id}_${user?.id}`
            : `${user?.id}_${currentUser?.id}`;

        const chatDocRef = doc(chatRef, chatId);
        const existingChatDoc = await getDoc(chatDocRef);

        if (existingChatDoc.exists()) {
            return { exists: true, chatId };
        } else {
            await setDoc(chatDocRef, {
                createdAt: serverTimestamp(),
                messages: []
            });

            // Ensure user documents exist before updating
            const userDocRef1 = doc(userChatsRef, user?.id);
            const userDocRef2 = doc(userChatsRef, currentUser?.id);

            // Create user documents if they don't exist
            await setDoc(userDocRef1, { chats: [] }, { merge: true });
            await setDoc(userDocRef2, { chats: [] }, { merge: true });

            // Update user data
            await updateDoc(userDocRef1, {
                chats: arrayUnion({
                    chatId,
                    lastMessage: '',
                    receiverId: currentUser?.id,
                    updatedAt: Date.now()
                })
            });

            await updateDoc(userDocRef2, {
                chats: arrayUnion({
                    chatId,
                    lastMessage: '',
                    receiverId: user?.id,
                    updatedAt: Date.now()
                })
            });

            return { exists: false, chatId };
        }
    } catch (error) {
        console.error("Error starting chat:", error);
        throw error;
    }
}

export async function fetchFriendRequests(currentUser) {
    if (!currentUser) return;

    try {
        const userDoc = doc(db, "friendRequests", currentUser.id); // Reference to the document in the friendRequests collection
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
            return userSnapshot.data(); // This should include both sentRequests and receivedRequests
        } else {
            return { sentRequests: [], receivedRequests: [] }; // Return empty arrays if the document doesn't exist
        }
    } catch (error) {
        console.error("Error fetching friend requests: ", error);
        throw new Error("Failed to fetch friend requests");
    }
}

export async function sendFriendRequest(currentUser: any, user: any) {
    console.log(currentUser)
    console.log(user)
    const currentUserRef = doc(db, 'friendRequests', currentUser.id);
    const recipientUserRef = doc(db, 'friendRequests', user.id);

    try {
        // Ensure current user's friendRequests document exists
        const currentUserDoc = await getDoc(currentUserRef);
        if (!currentUserDoc.exists()) {
            await setDoc(currentUserRef, {
                sentRequests: [],
                receivedRequests: [],
            });
        }

        // Ensure recipient user's friendRequests document exists
        const recipientUserDoc = await getDoc(recipientUserRef);
        if (!recipientUserDoc.exists()) {
            await setDoc(recipientUserRef, {
                sentRequests: [],
                receivedRequests: [],
            });
        }

        // Add to the current user's sent requests
        await updateDoc(currentUserRef, {
            sentRequests: arrayUnion(user.id)
        });

        // Add to the recipient user's received requests
        await updateDoc(recipientUserRef, {
            receivedRequests: arrayUnion(currentUser.id)
        });

        // Fetch and return the updated documents
        const updatedCurrentUserDoc = await getDoc(currentUserRef);
        const updatedRecipientUserDoc = await getDoc(recipientUserRef);

        return {
            sentRequests: updatedCurrentUserDoc.data()?.sentRequests || [],
            receivedRequests: updatedCurrentUserDoc.data()?.receivedRequests || []
        };
    } catch (error) {
        console.error("Error sending friend request:", error);
        throw error; // Optional: rethrow the error to be handled by the caller
    }
}

export async function cancelFriendRequest(currentUser: any, user: any) {
    const currentUserRef = doc(db, 'friendRequests', currentUser?.id);
    const recipientUserRef = doc(db, 'friendRequests', user?.id);

    try {
        // Remove from the current user's sent requests
        await updateDoc(currentUserRef, {
            sentRequests: arrayRemove(user?.id)
        });

        // Remove from the recipient user's received requests
        await updateDoc(recipientUserRef, {
            receivedRequests: arrayRemove(currentUser?.id)
        });
    } catch (error) {
        console.log("Error canceling friend request:", error);
    }
};