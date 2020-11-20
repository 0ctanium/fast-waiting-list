import Input from '@components/Form/Input/Input';
import React, { useCallback, useState } from 'react';
import Button from '@components/Button/Button';

export type JoinListFormProps = {
  onSubmit?: (values: JoinListFormValues) => void;
};

export type JoinListFormValues = {
  code: string;
};

const JoinListForm: React.FC<JoinListFormProps> = (props) => {
  const [state, setState] = useState<JoinListFormValues>({
    code: '',
  });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      props.onSubmit(state);
    },
    [props, state]
  );

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label={'Code'}
        id={'code'}
        name={'code'}
        type={'text'}
        placeholder={"Entrez le code d'accès"}
        onChange={handleChange}
        value={state.code}
        required
        autoComplete={'off'}
        fullWidth
        color={'#eaeaea'}
      />
      <Button type={'submit'}>Rejoindre</Button>
    </form>
  );
};

export default JoinListForm;
