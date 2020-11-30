import React, { useCallback, useState } from 'react';
import { Button, makeStyles, TextField } from '@material-ui/core';

export type JoinListFormProps = {
  onSubmit?: (values: JoinListFormValues) => void;
};

export type JoinListFormValues = {
  code: string;
};

const useStyles = makeStyles({
  input: {
    marginBottom: '1.5rem',
  },
  submit: {
    fontSize: '1rem',
  },
});

const validate = {
  code(val) {
    if (!val) return 'Veuillez entrer un code';
  },
};

const JoinListForm: React.FC<JoinListFormProps> = (props) => {
  const styles = useStyles();
  const [state, setState] = useState<JoinListFormValues>({
    code: '',
  });
  const [error, setError] = useState<Record<string, string>>({});

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    setError((prevState) => ({
      ...prevState,
      [name]: (validate[name] && validate[name](value)) || null,
    }));
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      console.log('test');

      if (
        Object.entries(validate).every(
          ([key, validator]) => !validator(state[key])
        )
      ) {
        console.log('ok');
        props.onSubmit(state);
      }
    },
    [props, state]
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <TextField
        label={'Code'}
        id={'code'}
        name={'code'}
        type={'text'}
        placeholder={"Entrez le code d'accès"}
        onChange={handleChange}
        value={state.code}
        error={!!error.code}
        helperText={error.code || ''}
        required
        autoComplete={'off'}
        fullWidth
        variant={'outlined'}
        className={styles.input}
      />
      <Button type={'submit'} variant={'outlined'} className={styles.submit}>
        Rejoindre
      </Button>
    </form>
  );
};

export default JoinListForm;
