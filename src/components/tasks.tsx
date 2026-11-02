import { ActionForm } from './form';
import { PillarSelect } from './ui';
import { Icon } from './icon';
import { localDate, pillars, shortDate } from '@/lib/domain';
import type { Task } from '@/lib/types';
export function TaskFields({ task }: { task?: Task }) {
  return (
    <>
      <label>
        Qual é o próximo passo?
        <input
          name="title"
          defaultValue={task?.title}
          placeholder="Uma tarefa pequena e concreta"
          required
          maxLength={160}
        />
      </label>
      <div className="form-row">
        <PillarSelect value={task?.pillar} />
        <label>
          Data
          <input
            type="date"
            name="due_date"
            defaultValue={task?.due_date ?? localDate()}
            required
          />
        </label>
        <label>
          Prioridade
          <select name="priority" defaultValue={task?.priority ?? 0}>
            <option value="0">Normal</option>
            <option value="1">Importante</option>
            <option value="2">Alta</option>
            <option value="3">Principal</option>
          </select>
        </label>
      </div>
    </>
  );
}
export function TaskRow({ task, compact = false }: { task: Task; compact?: boolean }) {
  const p = pillars.find((p) => p.id === task.pillar);
  return (
    <div className={`task-row ${task.completed_at ? 'completed' : ''}`}>
      <ActionForm action="task.toggle" className="check-form">
        <input type="hidden" name="id" value={task.id} />
        <input type="hidden" name="done" value={task.completed_at ? '0' : '1'} />
        <button
          className="task-check"
          aria-label={`${task.completed_at ? 'Reabrir' : 'Concluir'} ${task.title}`}
        >
          {task.completed_at && <Icon name="check" size={15} />}
        </button>
      </ActionForm>
      <div className="task-content">
        <span className="task-title">{task.title}</span>
        <span className="task-meta">
          <span className={`category-dot ${task.pillar}`} />
          {p?.label} <span>·</span> {shortDate(task.due_date)}{' '}
          {task.priority > 0 && (
            <span className="priority-label">
              {task.priority === 3 ? 'Principal' : task.priority === 2 ? 'Alta' : 'Importante'}
            </span>
          )}
        </span>
      </div>
      {!compact && (
        <details className="task-edit">
          <summary className="icon-button" aria-label={`Opções de ${task.title}`}>
            <Icon name="more" size={18} />
          </summary>
          <div className="edit-popover">
            <ActionForm action="task.update" className="stack">
              <input type="hidden" name="id" value={task.id} />
              <TaskFields task={task} />
              <button className="button primary">Guardar alterações</button>
            </ActionForm>
            <ActionForm
              action="task.delete"
              confirm="Eliminar esta tarefa? Esta ação não pode ser desfeita."
            >
              <input type="hidden" name="id" value={task.id} />
              <input type="hidden" name="confirm" value="yes" />
              <button className="button danger">
                <Icon name="trash" size={15} />
                Eliminar tarefa
              </button>
            </ActionForm>
          </div>
        </details>
      )}
    </div>
  );
}
