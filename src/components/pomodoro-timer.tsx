import { useCallback, useEffect, useState } from 'react';
import { useInterval } from '../hooks/see-interval';
import { Button } from './button';
import { Timer } from './timer';

// eslint-disable-next-line @typescript-eslint/no-var-requires
import bellStart from '../sounds/bell-start.mp3';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import bellFinish from '../sounds/bell-finish.mp3';
import { secondsToTime } from '../utils/seconds-to-times';

const audioStartStuding = new Audio(bellStart);
const audioStopStuding = new Audio(bellFinish);

interface Props {
  pomodoroTime: number;
  shortRestTime: number;
  longRestTime: number;
  cycles: number;
}

export function PomodoroTimer(props: Props): JSX.Element {
  const [mainTime, setMainTime] = useState(props.pomodoroTime);
  const [timeCounting, setTimeCounting] = useState(false);
  const [studing, setStuding] = useState(false);
  const [resting, setResting] = useState(false);
  const [cyclesQtdManager, setCyclesQtdManager] = useState(
    new Array(props.cycles - 1).fill(true),
  );

  const [completedCycles, setCompletedCycles] = useState(0);
  const [fullStudingTime, setFullStudingTime] = useState(0);
  const [numberOfPomodoros, setNumberOfPomodoros] = useState(0);

  useInterval(
    () => {
      setMainTime(mainTime - 1);
      if (studing) setFullStudingTime(fullStudingTime + 1);
    },

    timeCounting ? 1000 : null,
  );

  const configureStudy = useCallback(() => {
    setTimeCounting(true);
    setStuding(true);
    setResting(false);
    setMainTime(props.pomodoroTime);
    audioStartStuding.play();
  }, [
    setTimeCounting,
    setStuding,
    setResting,
    setMainTime,
    props.pomodoroTime,
  ]);

  const configureRest = useCallback(
    (long: boolean) => {
      setTimeCounting(true);
      setStuding(false);
      setResting(true);

      if (long) {
        setMainTime(props.longRestTime);
      } else {
        setMainTime(props.shortRestTime);
      }
      audioStopStuding.play();
    },
    [
      setTimeCounting,
      setStuding,
      setResting,
      setMainTime,
      props.longRestTime,
      props.shortRestTime,
    ],
  );

  useEffect(() => {
    if (studing) document.body.classList.add('studing');
    if (resting) document.body.classList.remove('studing');

    if (mainTime > 0) return;

    if (studing && cyclesQtdManager.length > 0) {
      configureRest(false);
      cyclesQtdManager.pop();
    } else if (studing && cyclesQtdManager.length <= 0) {
      configureRest(true);
      setCyclesQtdManager(new Array(props.cycles - 1).fill(true));
      setCompletedCycles(completedCycles + 1);
    }

    if (studing) setNumberOfPomodoros(numberOfPomodoros + 1);
    if (resting) configureStudy;
  }, [
    resting,
    studing,
    mainTime,
    cyclesQtdManager,
    numberOfPomodoros,
    completedCycles,
    configureRest,
    setCyclesQtdManager,
    configureStudy,
    props.cycles,
  ]);

  return (
    <div className="pomodoro">
      <h2>{timeCounting ? 'Você está estudando!!' : 'Vamos estudar?'}</h2>
      <Timer mainTime={mainTime} />

      <div className="controls">
        <Button
          text={timeCounting ? 'Studing' : 'Study'}
          onClick={() => configureStudy()}
        ></Button>
        <Button text="Rest" onClick={() => configureRest(false)}></Button>
        <Button
          className={!studing && !resting ? 'hidden' : ''}
          text={timeCounting ? 'Pause' : 'Play'}
          onClick={() => setTimeCounting(!timeCounting)}
        ></Button>
      </div>
      <div className="details">
        <p>Ciclos concluídos: {completedCycles}</p>
        <p>Horas trabalhadas: {secondsToTime(fullStudingTime)}</p>
        <p>Pomodoros concluídos: {numberOfPomodoros}</p>
      </div>
    </div>
  );
}
