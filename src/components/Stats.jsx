import React, {useEffect,useState} from 'react';

const Counter = ({target}) => {
    const [count,setCount] = useState(0);

    useEffect(()=>{
        let current =0;

        const duration = 1500;
        const incrementTime = 30;

        const increment = target / (duration/incrementTime);

        const timer = setInterval(() => {
            current += increment

            if (current >= target){
                current = target;
                clearInterval(timer);
            }

            setCount (Math.floor(current));

        }, incrementTime);
        
        return () => clearInterval(timer);
    },[target]);

    return <strong>{count}</strong>;
};

const Stats = () => {
  return (
   <>
    <div className="stats-container">
        <div className="stat-card">
            <Counter target={50} />
            <span>😊 Compliments</span>
        </div>

        <div className="stat-card">
                <Counter target={739} />
                <span>❤️ Smiles created</span>
        </div>
        <div className="stat-card">
            <Counter target={520} />
            <span>🌸 Kind students</span>
        </div>

    </div>
   </>
  )
}

export default Stats