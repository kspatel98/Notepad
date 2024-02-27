/**
 * Author: Kartik Patel
 * File name: Shortcuts.jsx
 * Purpose:
 */
import '../SASS/Shortcuts.css';
function Shortcuts()
{
    return (
        <div className="shortcuts">
            <div className='shortcutHeader'>Shortcuts</div>
            <div className="shortcutGrid">
                <div>Ctr+S</div>
                <div>Save file</div>
                <div>Ctr+Alt+N</div>
                <div>Create a new file</div>
                <div>Tab</div>
                <div>To give indentation for particular bullet point</div>
                <div>Enter</div>
                <div>To add a new bullet point below</div>
                <div>Backspace with cursor at the start</div>
                <div>It will decrease the indentation or if it does not have indentation, it will delete that particular bullet point.</div>
                <div>Alt+Arrow Up</div>
                <div>To switch the text value with above bulletpoint</div>
                <div>Alt+Arrow Down</div>
                <div>To switch the text value with below bulletpoint</div>
            </div>
        </div>
    )
}
export default Shortcuts;