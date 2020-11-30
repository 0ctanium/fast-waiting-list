import React, { useCallback, useState } from 'react';
import LoadingSpinner from '@icons/Loading';
import { Button, makeStyles, TextField } from '@material-ui/core';

export type CreateListFormProps = {
  onSubmit?: (values: CreateListFormValues) => void;
  loading?: boolean;
};

export type CreateListFormValues = {
  name: string;
  desc: string;
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
  name(val) {
    if (!val) return 'Veuillez entrer un nom';
  },
};

const CreateListForm: React.FC<CreateListFormProps> = (props) => {
  const styles = useStyles();
  const [state, setState] = useState<CreateListFormValues>({
    name: '',
    desc: '',
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
      if (
        Object.entries(validate).every(
          ([key, validator]) => !validator(state[key])
        ) &&
        !props.loading
      ) {
        props.onSubmit(state);
      }
    },
    [props, state]
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <TextField
        variant={'outlined'}
        label={'Titre'}
        id={'name'}
        name={'name'}
        type={'text'}
        placeholder={'Entrez le titre de la liste'}
        onChange={handleChange}
        value={state.name}
        error={!!error.name}
        helperText={error.name || ''}
        required
        autoComplete={'off'}
        fullWidth
        className={styles.input}
      />
      <TextField
        variant={'outlined'}
        label={'Description'}
        id={'desc'}
        name={'desc'}
        type={'text'}
        placeholder={"Decrivez le but dans la vie qu'aura cette liste"}
        onChange={handleChange}
        value={state.desc}
        autoComplete={'off'}
        fullWidth
        className={styles.input}
      />
      <Button type={'submit'} variant={'outlined'} className={styles.submit}>
        {props.loading ? <LoadingSpinner /> : 'Créer'}
      </Button>
    </form>
  );
};

export default CreateListForm;
