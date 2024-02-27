/**
 * Author: Kartik Patel
 * File name: About.jsx
 * Purpose:  
 */
import '../SASS/About.css';
function About() {
    return (
        <div className="about">
            <div className='aboutHeader'><span>About</span></div>
            <div className="aboutContent">
                <h1>Welcome to Notepad – Your Ultimate Tree-Structured Note-Taking Companion!</h1>
                <h2>At Notepad, we redefine the art of note-taking, offering you a dynamic and intuitive platform to organize your thoughts in a tree-like structure. With features designed for both simplicity and efficiency, Notepad empowers you to create intricate hierarchies of notes, making it easier than ever to manage complex projects or simply jot down your ideas in a structured manner.</h2>
                <h2>Key Features:</h2>
                <div className='aboutContentGrid'>
                    <h3>1. Tree-Structured Bulletpoints:</h3><h4>Create parent tasks, subtasks, and multi-level hierarchies effortlessly. Enjoy the flexibility of organizing your notes in a way that mirrors the natural flow of your thoughts.</h4>
                    <h3>2. Expand and Collapse:</h3><h4>Enhance readability by expanding or collapsing specific bullet points along with their children. This feature allows you to focus on the information that matters most to you, reducing clutter and improving overall user experience.</h4>
                    <h3>3. Alt+Arrow Key Functionality:</h3><h4>Swiftly swap text between bullet points above or below using the Alt+Arrow key combination. This seamless maneuverability ensures a smooth editing experience, saving you time and effort.</h4>
                    <h3>4. Tab for Indentation: </h3><h4>Employ the Tab key to add indentation to specific bullet points, further refining the structure of your notes. This feature is particularly useful for highlighting relationships between different tasks.</h4>
                    <h3>5. Drag and Drop:</h3><h4>Take advantage of our intuitive drag-and-drop functionality to effortlessly rearrange your notes. Customize the order of your tasks with a simple, user-friendly interface.</h4>
                    <h3>6. User Accounts:</h3><h4>Register for a Notepad account to unlock the full potential of our app. Your notes will be securely stored in the cloud, accessible from any device, anywhere in the world. Your data is encrypted, ensuring the utmost privacy and security.</h4>
                    <h3>7. Local Storage for Guest Users:</h3><h4>Not ready to create an account? No problem! Guest users can still enjoy the benefits of Notepad, with their files saved locally in the device's storage. Please note that these files won't be accessible from other devices.</h4>
                    <h3>8. Export as Word Doc:</h3><h4>Seamlessly export your meticulously organized notes as Word documents. Share your ideas, projects, or plans with others effortlessly.</h4>
                </div>
                <h2>Experience the convenience of structured note-taking with Notepad – where organization meets innovation. Sign up today to unlock a new level of productivity and creativity!</h2>
            </div>
        </div>
    )
}
export default About;