-- O histórico de operações sensíveis é legível/adicionável pelo proprietário,
-- mas não pode ser reescrito nem removido diretamente pela API.
revoke update,delete on public.audit_events from authenticated;
-- Necessário para apagar apenas os dados do chamador, incluindo o histórico.
-- O corpo fixa user_id=auth.uid() em cada operação e recusa sessão anónima.
alter function public.erase_personal_data() security definer;
